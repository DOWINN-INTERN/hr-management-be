import { CutoffStatus } from '@/common/enums/cutoff-status.enum';
import { CutoffType } from '@/common/enums/cutoff-type.enum';
import { UtilityHelper } from '@/common/helpers/utility.helper';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { Cutoff } from './entities/cutoff.entity';

@Injectable()
export class CutoffsService extends BaseService<Cutoff> {
    protected readonly logger = new Logger(CutoffsService.name);

    constructor(
        @InjectRepository(Cutoff)
        private readonly cutoffsRepository: Repository<Cutoff>,
        protected readonly usersService: UsersService
    ) {
        super(cutoffsRepository, usersService);
    }

    /**
     * Initialize cutoffs when application starts
     */
    async onModuleInit() {
        this.logger.log('Checking if cutoffs exist on application startup');
        try {
            const cutoffsCount = await this.cutoffsRepository.count();
            
            if (cutoffsCount === 0) {
                this.logger.log('No cutoffs found. Generating yearly cutoffs for current year.');
                const currentYear = new Date().getFullYear();
                await this.generateYearlyCutoffs({
                    year: currentYear,
                    startMonth: 0, // January
                    cutoffType: CutoffType.BI_WEEKLY,
                    save: true
                });
                this.logger.log('Initial yearly cutoffs generated successfully');
            } else {
                this.logger.log(`Found ${cutoffsCount} existing cutoffs. Skipping initial generation.`);
            }
            
            // Also update statuses of existing cutoffs on startup
            await this.updateCutoffStatuses();
            
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Error initializing cutoffs: ${error.message}`, error.stack);
            } else {
                this.logger.error(`Error initializing cutoffs: ${String(error)}`);
            }
        }
    }

    async generateYearlyCutoffs(
        options: {
            year?: number,
            startMonth?: number,
            cutoffType?: CutoffType,
            save?: boolean
        } = {}
    ): Promise<Cutoff[]> {
        const {
            year = new Date().getFullYear(),
            startMonth = new Date().getMonth(),
            cutoffType = CutoffType.BI_WEEKLY,
            save = true
        } = options;
        
        const cutoffs: Cutoff[] = [];
        
        // Generate cutoffs for each month from startMonth to December
        for (let month = startMonth; month < 12; month++) {
            const periodCutoffs = this.generateCutoffsForMonth(year, month, cutoffType);
            cutoffs.push(...periodCutoffs);
        }
        
        // Save to database if requested
        if (save && cutoffs.length > 0) {
            await this.cutoffsRepository.save(cutoffs);
        }
        
        return cutoffs;
    }
    
    private generateCutoffsForMonth(
        year: number, 
        month: number, 
        cutoffType: CutoffType
    ): Cutoff[] {
        const cutoffs: Cutoff[] = [];
        const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' });
        
        switch (cutoffType) {
            case CutoffType.BI_WEEKLY: {
                // For bi-weekly: 1-15 and 16-end of month
                const firstHalfStart = new Date(year, month, 1);
                const firstHalfEnd = new Date(year, month, 15);
                const secondHalfStart = new Date(year, month, 16);
                const secondHalfEnd = new Date(year, month + 1, 0);
                
                // Calculate business days
                const firstHalfBusinessDays = UtilityHelper.getBusinessDays(firstHalfStart, firstHalfEnd);
                const secondHalfBusinessDays = UtilityHelper.getBusinessDays(secondHalfStart, secondHalfEnd);
                
                // Create the cutoff entities
                const firstHalf = new Cutoff({});
                firstHalf.startDate = firstHalfStart;
                firstHalf.endDate = firstHalfEnd;
                firstHalf.status = CutoffStatus.ACTIVE;
                firstHalf.cutoffType = cutoffType;
                firstHalf.description = `${monthName} 1-15, ${year} (${firstHalfBusinessDays} business days)`;
                
                const secondHalf = new Cutoff({});
                secondHalf.startDate = secondHalfStart;
                secondHalf.endDate = secondHalfEnd;
                secondHalf.status = CutoffStatus.ACTIVE;
                secondHalf.cutoffType = cutoffType;
                secondHalf.description = `${monthName} 16-${secondHalfEnd.getDate()}, ${year} (${secondHalfBusinessDays} business days)`;
                
                cutoffs.push(firstHalf, secondHalf);
                break;
            }
            
            // Add other cutoff types if needed (WEEKLY, MONTHLY, etc.)
            
            default:
                break;
        }
        
        return cutoffs;
    }

    async getActiveCutoffs(): Promise<Cutoff[]> {
        return await this.repository.find({
            where: {
                status: CutoffStatus.ACTIVE,
                startDate: MoreThan(new Date()),
                isDeleted: false
            },
            order: { startDate: 'ASC' }
        });
    }

    async getActiveCutoff(): Promise<Cutoff | null> {
        return await this.repository.findOne({
            where: {
                status: CutoffStatus.ACTIVE,
                startDate: MoreThan(new Date()),
                isDeleted: false
            },
            order: { startDate: 'ASC' }
        });
    }

    /**
     * Updates cutoff statuses based on current date
     * - Active cutoffs with startDate <= today => PENDING
     * - Pending cutoffs with endDate < today => COMPLETED
     */
    async updateCutoffStatuses(): Promise<{ updated: number, errors: number }> {
        this.logger.log('Updating cutoff statuses based on current date');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        
        let updated = 0;
        let errors = 0;
        
        try {
            // Find active cutoffs that have started
            const activeCutoffs = await this.cutoffsRepository.find({
                where: {
                    status: CutoffStatus.ACTIVE,
                    startDate: LessThanOrEqual(today)
                }
            });
            
            if (activeCutoffs.length > 0) {
                this.logger.log(`Found ${activeCutoffs.length} active cutoffs to mark as PENDING`);
                
                const result = await this.cutoffsRepository.update(
                    { id: In(activeCutoffs.map(c => c.id)) },
                    { status: CutoffStatus.PENDING }
                );
                
                updated += result.affected || 0;
            }
            
            // Find pending cutoffs that have ended
            const pendingCutoffs = await this.cutoffsRepository.find({
                where: {
                    status: CutoffStatus.PENDING,
                    endDate: LessThanOrEqual(yesterday)
                }
            });
            
            if (pendingCutoffs.length > 0) {
                this.logger.log(`Found ${pendingCutoffs.length} pending cutoffs to mark as COMPLETED`);
                
                const result = await this.cutoffsRepository.update(
                    { id: In(pendingCutoffs.map(c => c.id)) },
                    { status: CutoffStatus.COMPLETED }
                );
                
                updated += result.affected || 0;
            }
            
            return { updated, errors };
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Error updating cutoff statuses: ${error.message}`, error.stack);
            } else {
                this.logger.error(`Error updating cutoff statuses: ${String(error)}`);
            }
            errors++;
            return { updated, errors };
        }
    }
    
    /**
     * Get the current active or pending cutoff
     */
    async getCurrentCutoff(): Promise<Cutoff | null> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // First try to find a PENDING cutoff that includes today
        const pendingCutoff = await this.cutoffsRepository.findOne({
            where: {
                status: CutoffStatus.PENDING,
                startDate: LessThanOrEqual(today),
                endDate: MoreThanOrEqual(today)
            }
        });
        
        if (pendingCutoff) {
            return pendingCutoff;
        }
        
        // If no pending cutoff, try to find the next ACTIVE cutoff
        return this.cutoffsRepository.findOne({
            where: {
                status: CutoffStatus.ACTIVE
            },
            order: {
                startDate: 'ASC'
            }
        });
    }
    
    /**
     * Scheduled job to automatically update cutoff statuses daily
     */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async scheduledCutoffStatusUpdate() {
        this.logger.log('Running scheduled cutoff status update');
        const result = await this.updateCutoffStatuses();
        this.logger.log(`Scheduled update complete. Updated: ${result.updated}, Errors: ${result.errors}`);
    }

    /**
     * Scheduled job to generate cutoffs for the next year
     * Runs on January 1st at 1:00 AM
     */
    @Cron('0 1 1 1 *')
    async generateNextYearCutoffs() {
        const nextYear = new Date().getFullYear() + 1;
        this.logger.log(`Running scheduled yearly cutoff generation for year ${nextYear}`);
        
        try {
            // Check if cutoffs already exist for the next year
            const existingCutoffs = await this.cutoffsRepository.count({
                where: {
                    startDate: MoreThanOrEqual(new Date(`${nextYear}-01-01`)),
                }
            });
            
            if (existingCutoffs > 0) {
                this.logger.log(`Cutoffs for year ${nextYear} already exist. Skipping generation.`);
                return;
            }
            
            // Generate cutoffs for the next year
            await this.generateYearlyCutoffs({
                year: nextYear,
                startMonth: 0,
                cutoffType: CutoffType.BI_WEEKLY,
                save: true
            });
            
            this.logger.log(`Successfully generated ${nextYear} cutoffs`);
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Error generating next year cutoffs: ${error.message}`, error.stack);
            } else {
                this.logger.error(`Error generating next year cutoffs: ${String(error)}`);
            }
        }
    }
}