import { Injectable, Logger, OnModuleDestroy, OnModuleInit, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';
import * as crypto from 'crypto';
import { PerformanceObserver, performance } from 'perf_hooks';
import * as puppeteer from 'puppeteer';
import { MarginOptions } from '../controllers/html-to-pdf.controller';

export type PdfGenerationOptions = {
    fileName?: string;
    headerTemplate?: string;
    footerTemplate?: string;
    margins?: MarginOptions;
    landscape?: boolean;
    scale?: number;
    cacheKey?: string;
    bypassCache?: boolean;
    format?: puppeteer.PaperFormat;
    printBackground?: boolean;
    preferCSSPageSize?: boolean;
    timeout?: number;
    watermark?: string;
};

export enum PdfServiceEvent {
    PDF_GENERATED = 'pdf.generated',
    PDF_ERROR = 'pdf.error',
    BROWSER_RESTARTED = 'browser.restarted',
    CACHE_HIT = 'cache.hit',
    CACHE_MISS = 'cache.miss'
}

@Injectable({ scope: Scope.DEFAULT })
export class HtmlToPdfService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(HtmlToPdfService.name);
    private browser: puppeteer.Browser | null = null;
    private browserPromise: Promise<puppeteer.Browser> | null = null;
    private activePages = 0;
    private pageQueue: { resolve: Function, reject: Function, task: Function, priority: number, timestamp: number }[] = [];

    // Performance tracking
    private generateTimes: number[] = [];
    private lastPerformanceReport = Date.now();

    // Configuration
    private readonly maxConcurrentPages: number;
    private readonly timeout: number;
    private readonly memoryLimit: number;
    private readonly performanceMonitoring: boolean;
    private readonly maxQueueAge: number; // ms before considering a queued task as stale
    private readonly browserRestartInterval: number; // ms between browser restarts
    private readonly useChromium: boolean;
    private lastBrowserRestart = Date.now();

    constructor(
        private configService: ConfigService,
        private schedulerRegistry: SchedulerRegistry,
        private eventEmitter: EventEmitter2
    ) {
        this.maxConcurrentPages = this.configService.get<number>('PDF_MAX_CONCURRENT_PAGES', 10);
        this.timeout = this.configService.get<number>('PDF_GENERATION_TIMEOUT', 30000);
        this.memoryLimit = this.configService.get<number>('PDF_MEMORY_LIMIT', 512);
        this.performanceMonitoring = this.configService.get<boolean>('PDF_PERFORMANCE_MONITORING', true);
        this.maxQueueAge = this.configService.get<number>('PDF_MAX_QUEUE_AGE', 120000); // 2 minutes
        this.browserRestartInterval = this.configService.get<number>('PDF_BROWSER_RESTART_INTERVAL', 3600000); // 1 hour
        this.useChromium = this.configService.get<boolean>('PDF_USE_CHROMIUM', true);

        if (this.performanceMonitoring) {
            const obs = new PerformanceObserver((items) => {
                items.getEntries().forEach(entry => {
                    if (entry.name.startsWith('pdf-generation')) {
                        this.generateTimes.push(entry.duration);
                    }
                });
                performance.clearMarks();
            });
            obs.observe({ entryTypes: ['measure'] });
        }
    }

    async onModuleInit() {
        await this.getBrowser();

        const healthInterval = setInterval(() => this.checkBrowserHealth(), 60000);
        this.schedulerRegistry.addInterval('browserHealthCheck', healthInterval);

        if (this.performanceMonitoring) {
            const perfInterval = setInterval(() => this.reportPerformance(), 300000);
            this.schedulerRegistry.addInterval('pdfPerformanceReport', perfInterval);
        }

        const queueInterval = setInterval(() => this.cleanStaleQueueItems(), 30000);
        this.schedulerRegistry.addInterval('queueCleaner', queueInterval);

        const restartInterval = setInterval(() => this.restartBrowserIfNeeded(), this.browserRestartInterval);
        this.schedulerRegistry.addInterval('browserRestart', restartInterval);
    }

    async onModuleDestroy() {
        if (this.browser) {
            await this.browser.close().catch(err => {
                this.logger.error(`Error closing browser: ${err.message}`);
            });
            this.browser = null;
        }
    }

    private async checkBrowserHealth(): Promise<void> {
        try {
            if (!this.browser) {
                this.logger.warn('Browser not found during health check, restarting');
                await this.getBrowser();
                return;
            }
            if (!this.browser.isConnected()) {
                this.logger.warn('Browser is disconnected, restarting');
                this.browser = null;
                this.browserPromise = null;
                await this.getBrowser();
                return;
            }
            const pages = await this.browser.pages().catch(err => {
                this.logger.error(`Error getting pages: ${err.message}`);
                return [];
            });
            this.logger.debug(`Health check: ${pages.length} open pages, ${this.activePages} active pages, ${this.pageQueue.length} queued tasks`);
            if (pages.length > this.activePages + 1) {
                this.logger.warn(`Found ${pages.length - this.activePages - 1} zombie pages, cleaning up`);
                await Promise.all(pages.slice(1).map(async (page) => {
                    try {
                        const url = await page.url();
                        if (url === 'about:blank') {
                            await page.close();
                        }
                    } catch (e) {}
                }));
            }
            const metrics = await this.getProcessMetrics();
            if (metrics.jsHeapSizeLimit - metrics.jsHeapSizeUsed < 50 * 1024 * 1024) {
                this.logger.warn(`Low memory detected (${Math.round(metrics.jsHeapSizeUsed/1024/1024)}MB used of ${Math.round(metrics.jsHeapSizeLimit/1024/1024)}MB), restarting browser`);
                await this.restartBrowser();
            }
        } catch (err: any) {
            this.logger.error(`Browser health check failed: ${err.message}`);
            this.browser = null;
            this.browserPromise = null;
            await this.getBrowser();
        }
    }

    private async getProcessMetrics(): Promise<any> {
        if (!this.browser || !this.browser.isConnected()) {
            return { jsHeapSizeUsed: 0, jsHeapSizeLimit: Infinity };
        }
        try {
            const pages = await this.browser.pages();
            if (pages.length === 0) return { jsHeapSizeUsed: 0, jsHeapSizeLimit: Infinity };
            const metrics = await pages[0].metrics();
            return metrics;
        } catch (err: any) {
            this.logger.error(`Failed to get metrics: ${err.message}`);
            return { jsHeapSizeUsed: 0, jsHeapSizeLimit: Infinity };
        }
    }

    private async restartBrowserIfNeeded(): Promise<void> {
        const timeSinceRestart = Date.now() - this.lastBrowserRestart;
        if (timeSinceRestart >= this.browserRestartInterval && this.browser) {
            this.logger.log(`Scheduled browser restart after ${Math.round(timeSinceRestart/1000/60)} minutes uptime`);
            await this.restartBrowser();
        }
    }

    private async restartBrowser(): Promise<void> {
        if (!this.browser) return;
        try {
            await this.processQueueWithTimeout(30000);
            await this.browser.close().catch(err => {
                this.logger.error(`Error closing browser during restart: ${err.message}`);
            });
        } finally {
            this.browser = null;
            this.browserPromise = null;
            if (global.gc) {
                this.logger.debug('Forcing garbage collection');
                global.gc();
            }
            await this.getBrowser();
            this.lastBrowserRestart = Date.now();
            this.eventEmitter.emit(PdfServiceEvent.BROWSER_RESTARTED);
        }
    }

    private cleanStaleQueueItems(): void {
        const now = Date.now();
        const originalLength = this.pageQueue.length;
        this.pageQueue = this.pageQueue.filter(item => {
            const age = now - item.timestamp;
            if (age > this.maxQueueAge) {
                item.reject(new Error(`Request timeout - waited in queue for ${Math.round(age/1000)} seconds`));
                return false;
            }
            return true;
        });
        if (originalLength !== this.pageQueue.length) {
            this.logger.warn(`Removed ${originalLength - this.pageQueue.length} stale items from queue`);
        }
    }

    private async processQueueWithTimeout(timeout: number): Promise<void> {
        if (this.pageQueue.length === 0) return;
        const startTime = Date.now();
        this.logger.debug(`Processing ${this.pageQueue.length} queued items with ${timeout}ms timeout`);
        while (this.pageQueue.length > 0) {
            if (Date.now() - startTime > timeout) {
                this.logger.warn(`Queue processing timed out after ${Math.round((Date.now() - startTime)/1000)}s with ${this.pageQueue.length} items remaining`);
                break;
            }
            const nextTask = this.pageQueue.shift();
            if (nextTask) {
                this.activePages++;
                try {
                    const page = await nextTask.task();
                    nextTask.resolve(page);
                } catch (error) {
                    this.activePages--;
                    nextTask.reject(error);
                }
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    private reportPerformance(): void {
        if (!this.performanceMonitoring || this.generateTimes.length === 0) return;
        const times = [...this.generateTimes];
        this.generateTimes = [];
        const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
        const min = Math.min(...times);
        const max = Math.max(...times);
        const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];
        this.logger.log(`PDF Performance: ${times.length} PDFs generated in the last ${Math.round((Date.now() - this.lastPerformanceReport)/1000/60)}m`);
        this.logger.log(`Avg: ${Math.round(avg)}ms, Min: ${Math.round(min)}ms, Max: ${Math.round(max)}ms, P95: ${Math.round(p95)}ms`);
        this.lastPerformanceReport = Date.now();
    }

    public async getBrowser(): Promise<puppeteer.Browser> {
        if (this.browser) {
            return this.browser;
        }
        if (!this.browserPromise) {
            const startTime = Date.now();
            this.logger.log('Launching browser...');
            this.browserPromise = puppeteer.launch({
                headless: true,
                executablePath: this.useChromium ? undefined : process.env.CHROME_BIN,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-extensions',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    `--max-old-space-size=${this.memoryLimit}`,
                ],
                timeout: this.timeout,
                defaultViewport: { width: 1200, height: 1600, deviceScaleFactor: 1 },
                protocolTimeout: this.timeout,
            }).then(browser => {
                this.logger.log(`Browser launched in ${Date.now() - startTime}ms`);
                return browser;
            }).catch(err => {
                this.logger.error(`Failed to launch browser: ${err.message}`);
                this.browserPromise = null;
                throw err;
            });
            try {
                this.browser = await this.browserPromise;
                this.browser.on('disconnected', () => {
                    this.logger.warn('Browser disconnected');
                    this.browser = null;
                    this.browserPromise = null;
                    const queuedTasks = [...this.pageQueue];
                    this.pageQueue = [];
                    for (const task of queuedTasks) {
                        task.reject(new Error('Browser disconnected'));
                    }
                });
                this.lastBrowserRestart = Date.now();
            } catch (error) {
                this.browserPromise = null;
                throw error;
            }
        }
        return this.browserPromise;
    }

    private async acquirePage(priority = 0): Promise<puppeteer.Page> {
        if (this.activePages < this.maxConcurrentPages) {
            this.activePages++;
            try {
                const browser = await this.getBrowser();
                const page = await browser.newPage();
                await page.setDefaultNavigationTimeout(this.timeout);
                await page.setJavaScriptEnabled(true);
                const session = await page.target().createCDPSession();
                await session.send('Page.setDownloadBehavior', { behavior: 'deny' });
                await session.send('Network.setBlockedURLs', { urls: ['*.mp4', '*.webm', '*.ogg', '*.mp3', '*.wav', '*.gif'] });
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    const resourceType = request.resourceType();
                    if (['image', 'media', 'font', 'websocket'].includes(resourceType)) {
                        request.abort();
                    } else {
                        request.continue();
                    }
                });
                return page;
            } catch (error) {
                this.activePages--;
                throw error;
            }
        }
        return new Promise((resolve, reject) => {
            this.pageQueue.push({
                resolve,
                reject,
                priority,
                timestamp: Date.now(),
                task: async () => {
                    try {
                        const browser = await this.getBrowser();
                        const page = await browser.newPage();
                        await page.setDefaultNavigationTimeout(this.timeout);
                        await page.setJavaScriptEnabled(true);
                        const session = await page.target().createCDPSession();
                        await session.send('Page.setDownloadBehavior', { behavior: 'deny' });
                        await session.send('Network.setBlockedURLs', { urls: ['*.mp4', '*.webm', '*.ogg', '*.mp3', '*.wav', '*.gif'] });
                        await page.setRequestInterception(true);
                        page.on('request', (request) => {
                            const resourceType = request.resourceType();
                            if (['image', 'media', 'font', 'websocket'].includes(resourceType)) {
                                request.abort();
                            } else {
                                request.continue();
                            }
                        });
                        return page;
                    } catch (error) {
                        throw error;
                    }
                }
            });
            this.pageQueue.sort((a, b) => b.priority - a.priority);
        });
    }

    private async releasePage(page: puppeteer.Page): Promise<void> {
        try {
            await page.close();
        } catch (e: any) {
            this.logger.warn(`Error closing page: ${e.message}`);
        }
        this.activePages--;
        if (this.pageQueue.length > 0) {
            this.pageQueue.sort((a, b) => b.priority - a.priority);
            const nextTask = this.pageQueue.shift();
            if (nextTask) {
                this.activePages++;
                try {
                    const page = await nextTask.task();
                    nextTask.resolve(page);
                } catch (error) {
                    this.activePages--;
                    nextTask.reject(error);
                }
            }
        }
    }

    async generatePdf(
    htmlContent: string,
    options?: PdfGenerationOptions,
    retryCount = 2
): Promise<Buffer> {
    let markId: string | undefined;
    if (this.performanceMonitoring) {
        markId = `pdf-generation-${Date.now()}`;
        performance.mark(`${markId}-start`);
    }

    let page: puppeteer.Page | undefined;

    try {
        const priority = retryCount === 2 ? 0 : retryCount === 1 ? 1 : 2;
        page = await this.acquirePage(priority);

        if (options?.watermark) {
            htmlContent = this.addWatermark(htmlContent, options.watermark);
        }

        await Promise.race([
            page.setContent(htmlContent, {
                waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
                timeout: options?.timeout || this.timeout
            }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout setting page content')),
                    options?.timeout || this.timeout)
            )
        ]);

        await this.enhancePageForPdf(page);

        const pdfBuffer = await Promise.race([
            page.pdf({
                format: options?.format || 'A4',
                printBackground: options?.printBackground !== false,
                margin: options?.margins || {
                    top: '30mm',
                    right: '20mm',
                    bottom: '30mm',
                    left: '20mm'
                },
                displayHeaderFooter: !!(options?.headerTemplate || options?.footerTemplate),
                headerTemplate: options?.headerTemplate || '<span></span>',
                footerTemplate: options?.footerTemplate || '<span></span>',
                path: options?.fileName,
                landscape: options?.landscape || false,
                scale: options?.scale || 1,
                preferCSSPageSize: options?.preferCSSPageSize || false,
                timeout: options?.timeout || this.timeout
            }),
            new Promise<Buffer>((_, reject) =>
                setTimeout(() => reject(new Error('Timeout generating PDF')),
                    options?.timeout || this.timeout)
            )
        ]) as Buffer;

        if (this.performanceMonitoring && markId) {
            performance.mark(`${markId}-end`);
            performance.measure(`pdf-generation`, `${markId}-start`, `${markId}-end`);
        }

        this.eventEmitter.emit(PdfServiceEvent.PDF_GENERATED, {
            bytes: pdfBuffer.length,
            cached: false,
            options: {
                landscape: options?.landscape,
                hasHeader: !!options?.headerTemplate,
                hasFooter: !!options?.footerTemplate,
            }
        });

        return pdfBuffer;
    } catch (error: any) {
        this.logger.error(`Error generating PDF: ${error.message}`);
        this.eventEmitter.emit(PdfServiceEvent.PDF_ERROR, {
            error: error.message,
            htmlLength: htmlContent.length,
            retryCount
        });
        if ((error.message.includes('browser has disconnected') ||
            error.message.includes('Target closed') ||
            error.message.includes('Session closed')) &&
            retryCount > 0) {
            this.logger.warn(`Browser issue, attempting to recreate and retry (${retryCount} retries left)`);
            if (page) {
                try {
                    await page.close().catch(() => {});
                    this.activePages--;
                } catch {}
            }
            this.browser = null;
            this.browserPromise = null;
            await new Promise(resolve => setTimeout(resolve, 1000));
            return this.generatePdf(htmlContent, options, retryCount - 1);
        }
        throw error;
    } finally {
        if (page) {
            await this.releasePage(page);
        }
    }
}
    private async enhancePageForPdf(page: puppeteer.Page): Promise<void> {
        await page.evaluate(() => {
            return new Promise<void>((resolve) => {
                if (document.fonts && document.fonts.ready) {
                    document.fonts.ready.then(() => resolve());
                } else {
                    setTimeout(resolve, 1000);
                }
            });
        });
        await page.evaluate(() => {
            return new Promise<void>((resolve) => {
                const images = document.querySelectorAll('img');
                if (images.length === 0) {
                    resolve();
                    return;
                }
                let loadedCount = 0;
                const imageLoadListener = () => {
                    loadedCount++;
                    if (loadedCount === images.length) {
                        resolve();
                    }
                };
                images.forEach(img => {
                    if (img.complete) {
                        loadedCount++;
                    } else {
                        img.addEventListener('load', imageLoadListener);
                        img.addEventListener('error', imageLoadListener);
                    }
                });
                if (loadedCount === images.length) {
                    resolve();
                }
                setTimeout(resolve, 2000);
            });
        });
    }

    private addWatermark(html: string, watermarkText: string): string {
        const watermarkStyle = `
            <style>
                body {
                    position: relative;
                }
                body::after {
                    content: "${watermarkText}";
                    position: fixed;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    z-index: 1000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 100px;
                    color: rgba(200, 200, 200, 0.3);
                    transform: rotate(-45deg);
                    pointer-events: none;
                }
            </style>
        `;
        if (html.includes('</head>')) {
            return html.replace('</head>', `${watermarkStyle}</head>`);
        } else {
            return `<head>${watermarkStyle}</head>${html}`;
        }
    }

    private generateCacheKey(htmlContent: string, options?: any): string {
        const cacheableOptions = {
            margins: options?.margins,
            landscape: options?.landscape,
            scale: options?.scale,
            headerTemplate: options?.headerTemplate,
            footerTemplate: options?.footerTemplate,
            format: options?.format,
            printBackground: options?.printBackground,
            preferCSSPageSize: options?.preferCSSPageSize,
        };
        const contentHash = crypto.createHash('sha256')
            .update(htmlContent)
            .digest('hex')
            .substring(0, 10);
        const optionsHash = crypto.createHash('sha256')
            .update(JSON.stringify(cacheableOptions))
            .digest('hex')
            .substring(0, 8);
        return `pdf-${contentHash}-${optionsHash}`;
    }

    async healthCheck(): Promise<{healthy: boolean, metrics: any}> {
        try {
            const browser = await this.getBrowser();
            const pages = await browser.pages().catch(() => []);
            const metrics = {
                activePages: this.activePages,
                queueLength: this.pageQueue.length,
                openPages: pages.length,
                browserUptime: Math.round((Date.now() - this.lastBrowserRestart) / 1000 / 60) + ' minutes',
                averageGenerationTime: this.generateTimes.length > 0
                    ? Math.round(this.generateTimes.reduce((sum, time) => sum + time, 0) / this.generateTimes.length) + 'ms'
                    : 'No data'
            };
            return { healthy: true, metrics };
        } catch (error: any) {
            this.logger.error(`Health check failed: ${error.message}`);
            return {
                healthy: false,
                metrics: { error: error.message }
            };
        }
    }
}
