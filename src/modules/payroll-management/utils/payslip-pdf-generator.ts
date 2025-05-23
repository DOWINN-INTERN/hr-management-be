import PDFDocument from 'pdfkit';

export async function generatePayslipPdf(payslipData: any): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        try {
            // Ensure all required nested objects exist to prevent undefined errors
            payslipData = {
                employee: payslipData.employee || {},
                workHours: payslipData.workHours || {},
                compensation: payslipData.compensation || {},
                deductions: payslipData.deductions || {},
                rates: payslipData.rates || {},
                totals: payslipData.totals || {},
                cutoffPeriod: payslipData.cutoffPeriod || 'N/A',
                payrollDate: payslipData.payrollDate || 'N/A',
                benefits: payslipData.benefits || [],
                allowances: payslipData.allowances || [],
                ...payslipData
            };
            
            // Ensure nested objects within deductions exist
            payslipData.deductions.governmentMandated = payslipData.deductions.governmentMandated || {};
            payslipData.deductions.basic = payslipData.deductions.basic || {};
            payslipData.deductions.others = payslipData.deductions.others || [];
            
            // Create default values for totals if they don't exist
            payslipData.totals.grossPay = payslipData.totals.grossPay || 0;
            payslipData.totals.totalDeductions = payslipData.totals.totalDeductions || 0;
            payslipData.totals.totalAllowances = payslipData.totals.totalAllowances || 0;
            payslipData.totals.netPay = payslipData.totals.netPay || 0;
            payslipData.totals.taxableIncome = payslipData.totals.taxableIncome || 0;

            const buffers: Buffer[] = [];
            const doc = new PDFDocument({ 
                margin: 50,
                size: 'A4',
                bufferPages: true
            });
            
            // Collect PDF data chunks
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });

            // A4 dimensions
            const A4Width = 595.28;
            const A4Height = 841.89;
            const margin = 50;

            // Available space after margins
            const availableWidth = A4Width - 2 * margin;
            const availableHeight = A4Height - 2 * margin;

            // Width of each rectangle (dividing available width by 3)
            const rectWidth = (availableWidth / 3) - 10;
            
            // Define consistent styling
            const styles = {
                header: { fontSize: 10, font: 'Helvetica-Bold', color: '#333333' },
                subheader: { fontSize: 12, font: 'Helvetica-Bold', color: '#333333' },
                title: { fontSize: 18, font: 'Helvetica-Bold', color: '#000000' },
                normal: { fontSize: 10, font: 'Helvetica', color: '#333333' },
                small: { fontSize: 8, font: 'Helvetica', color: '#666666' },
                highlight: { fontSize: 12, font: 'Helvetica-Bold', color: '#000000' },
                tableHeader: { fontSize: 9, font: 'Helvetica-Bold', color: '#333333' },
                tableCell: { fontSize: 9, font: 'Helvetica', color: '#333333' },
                money: { fontSize: 10, font: 'Helvetica-Bold', color: '#000000' }
            };
            
            // Try to load company logo if it exists (adapt path as needed)
            // try {
            //     const logoPath = path.resolve(process.cwd(), 'assets/company_logo.png');
            //     if (fs.existsSync(logoPath)) {
            //         doc.image(logoPath, 50, 45, { width: 100 });
            //     }
            // } catch (err) {
            //     // Logo loading failed - continue without it
            //     console.log('Company logo not found, continuing without it');
            // }

            const employee = payslipData.employee;
            // Document Header with Company Information
            // doc.font(styles.title.font)
            //      .fontSize(styles.title.fontSize)
            //      .fillColor(styles.title.color)
            //      .text(String(employee.organization).toUpperCase(), { align: 'center' });
            
            // doc.font(styles.small.font)
            //      .fontSize(styles.small.fontSize)
            //      .fillColor(styles.small.color)
            //      .text('123 Corporate Plaza, Business District', { align: 'center' })
            //      .text('City, State, ZIP | Phone: (123) 456-7890', { align: 'center' })
            //      .text('Email: hr@companyname.com | Web: www.companyname.com', { align: 'center' });

            const startY = 50;

            // Payslip Title Banner
            drawFilledRect(doc, margin, startY, doc.page.width - 100, 30, '#f1f1f1');
            doc.font(styles.title.font)
                 .fontSize(styles.title.fontSize)
                 .fillColor(styles.title.color)
                 .text('EMPLOYEE PAYSLIP', margin, startY + 9, { align: 'center' });
            
            // Employee and Payroll Information Section
            const employeeInfoY = startY + 40;
            drawOutlinedRect(doc, 50, employeeInfoY, doc.page.width - 100, 120);
            
            // Left column - Employee Info
            doc.font(styles.header.font)
                 .fontSize(styles.header.fontSize)
                 .fillColor(styles.header.color)
                 .text('EMPLOYEE INFORMATION', 60, employeeInfoY + 10);
            
            doc.font(styles.normal.font)
                 .fontSize(styles.normal.fontSize)
                 .fillColor(styles.normal.color)
                 .text(`Employee #: ${employee.employeeNumber}`, 60, employeeInfoY + 30)
                 .text(`Name: ${employee.name}`, 60, employeeInfoY + 45)
                 .text(`Position: ${employee.position}`, 60, employeeInfoY + 60)
                 .text(`Department: ${employee.department}`, 60, employeeInfoY + 75)
                 .text(`Branch: ${employee.branch}`, 60, employeeInfoY + 90)
                 .text(`Organization: ${employee.organization}`, 60, employeeInfoY + 105)
            
            // Right column - Payroll Info
            doc.font(styles.header.font)
                 .fontSize(styles.header.fontSize)
                 .fillColor(styles.header.color)
                 .text('PAYROLL INFORMATION', 350, employeeInfoY + 10);
            
            doc.font(styles.normal.font)
                 .fontSize(styles.normal.fontSize)
                 .fillColor(styles.normal.color)
                 .text(`Cutoff Period: ${payslipData.cutoffPeriod}`, 350, employeeInfoY + 30)
                 .text(`Pay Date: ${payslipData.payrollDate}`, 350, employeeInfoY + 45)
                 .text(`Payroll #: ${payslipData.payrollReferenceNumber || 'N/A'}`, 350, employeeInfoY + 60)

            // Rates section
            const ratesY = employeeInfoY + 130;
            drawFilledRect(doc, 50, ratesY, doc.page.width - 100, 25, '#f1f1f1');
            doc.font(styles.subheader.font)
                 .fontSize(styles.subheader.fontSize)
                 .fillColor(styles.subheader.color)
                 .text('PAY RATE INFORMATION', 60, ratesY + 8);
            
            const ratesDetailY = ratesY + 35;
            doc.font(styles.normal.font)
                 .fontSize(styles.normal.fontSize)
                 .fillColor(styles.normal.color);
            
            // Draw rates in a 2x2 grid
            drawInfoBox(doc, 'Monthly Rate', formatCurrency(payslipData.rates.monthly), margin, ratesDetailY, rectWidth);
            drawInfoBox(doc, 'Daily Rate', formatCurrency(payslipData.rates.daily), margin + rectWidth + 15, ratesDetailY, rectWidth);
            drawInfoBox(doc, 'Hourly Rate', formatCurrency(payslipData.rates.hourly), margin + (2 * rectWidth) + 30, ratesDetailY, rectWidth);

            // Main columns layout - Earnings and Deductions side by side
            const columnsStartY = ratesDetailY + 50;
            const colWidth = (doc.page.width - 100) / 2 - 10;
            
            // Earnings Column
            drawFilledRect(doc, 50, columnsStartY, colWidth, 25, '#f1f1f1');
            doc.font(styles.subheader.font)
                 .fontSize(styles.subheader.fontSize)
                 .fillColor(styles.subheader.color)
                 .text('EARNINGS', 60, columnsStartY + 8);
            
            // Draw earnings table
            let currentY = columnsStartY + 35;
            const earnings = payslipData.compensation;
            const regularEarnings = [
                { description: 'Basic Pay', hours: payslipData.workHours.regular || 0, amount: earnings.basicPay || 0 },
                { description: 'Overtime', hours: payslipData.workHours.overtime || 0, amount: earnings.overtimePay || 0 },
                { description: 'Regular Holiday', hours: payslipData.workHours.holiday || 0, amount: earnings.holidayPay || 0 },
                { description: 'Holiday Overtime', hours: payslipData.workHours.holidayOvertime || 0, amount: earnings.holidayOvertimePay || 0 },
                { description: 'Special Holiday', hours: payslipData.workHours.specialHoliday || 0, amount: earnings.specialHolidayPay || 0 },
                { description: 'Special Holiday OT', hours: payslipData.workHours.specialHolidayOvertime || 0, amount: earnings.specialHolidayOvertimePay || 0 },
                { description: 'Rest Day', hours: payslipData.workHours.restDay || 0, amount: earnings.restDayPay || 0 },
                { description: 'Rest Day OT', hours: payslipData.workHours.restDayOvertime || 0, amount: earnings.restDayOvertimePay || 0 },
                { description: 'Night Differential', hours: payslipData.workHours.nightDifferential || 0, amount: earnings.nightDifferentialPay || 0 },
                { description: 'Night Differential OT', hours: payslipData.workHours.nightDifferentialOvertime || 0, amount: earnings.nightDifferentialOvertimePay || 0 }
            ].filter(item => (item.amount || 0) > 0);  // Add fallback for undefined amounts
            
            currentY = drawTable(
                doc,
                ['Description', 'Hours', 'Amount'],
                regularEarnings.map(e => [e.description, Number(e.hours).toFixed(2), formatCurrency(e.amount)]),
                [50, currentY, colWidth],
                styles,
                [0.45, 0.2, 0.35]
            );
            
            // Add adjustments if any
            if (earnings.adjustments && earnings.adjustments.length > 0) {
                currentY += 10;
                doc.font(styles.header.font)
                     .fontSize(styles.header.fontSize)
                     .fillColor(styles.header.color)
                     .text('Adjustments', 60, currentY);
                
                currentY += 15;
                currentY = drawTable(
                    doc,
                    ['Description', 'Amount'],
                    earnings.adjustments.map((a: any) => [a.name, formatCurrency(a.amount)]),
                    [50, currentY, colWidth],
                    styles,
                    [0.7, 0.3]
                );
            }
            
            // Add other earnings if any
            if (earnings.others && earnings.others.length > 0) {
                currentY += 10;
                doc.font(styles.header.font)
                     .fontSize(styles.header.fontSize)
                     .fillColor(styles.header.color)
                     .text('Other Earnings', 60, currentY);
                
                currentY += 15;
                currentY = drawTable(
                    doc,
                    ['Description', 'Amount'],
                    earnings.others.map((a: any) => [a.name, formatCurrency(a.amount)]),
                    [50, currentY, colWidth],
                    styles,
                    [0.7, 0.3]
                );
            }
            
            // Add allowances if any
            if (payslipData.allowances && payslipData.allowances.length > 0) {
                currentY += 10;
                doc.font(styles.header.font)
                     .fontSize(styles.header.fontSize)
                     .fillColor(styles.header.color)
                     .text('Allowances', 60, currentY);
                
                currentY += 15;
                currentY = drawTable(
                    doc,
                    ['Description', 'Amount'],
                    payslipData.allowances.map((a: any) => [a.name, formatCurrency(a.amount)]),
                    [50, currentY, colWidth],
                    styles,
                    [0.7, 0.3]
                );
            }
            
            // Add benefits if any
            if (payslipData.benefits && payslipData.benefits.length > 0) {
                currentY += 10;
                doc.font(styles.header.font)
                     .fontSize(styles.header.fontSize)
                     .fillColor(styles.header.color)
                     .text('Benefits', 60, currentY);
                
                currentY += 15;
                currentY = drawTable(
                    doc,
                    ['Description', 'Amount'],
                    payslipData.benefits.map((b: any) => [b.name, formatCurrency(b.amount)]),
                    [50, currentY, colWidth],
                    styles,
                    [0.6, 0.4]
                );
            }
            
            // Calculate total earnings
            currentY += 10;
            doc.font(styles.highlight.font)
                 .fontSize(styles.highlight.fontSize)
                 .fillColor(styles.highlight.color);
            doc.text('Total Earnings:', 60, currentY);
            doc.text(formatCurrency(payslipData.totals.grossPay), 20 + colWidth - 80, currentY, { width: 100, align: 'right' });
            
            // Deductions Column
            const deductionsX = 50 + colWidth + 20;
            drawFilledRect(doc, deductionsX, columnsStartY, colWidth, 25, '#f1f1f1');
            doc.font(styles.subheader.font)
                 .fontSize(styles.subheader.fontSize)
                 .fillColor(styles.subheader.color)
                 .text('DEDUCTIONS', deductionsX + 10, columnsStartY + 8);
            
            // Draw deductions
            let deductionsY = columnsStartY + 30;
            const deductions = payslipData.deductions;

            // Basic deductions if any
            if (deductions.basic) {
                const basicDeductions = [
                    { description: 'Absences', amount: deductions.basic.absences || 0 },
                    { description: 'Tardiness', amount: deductions.basic.tardiness || 0 },
                    { description: 'Undertime', amount: deductions.basic.undertime || 0 },
                    { description: 'No Time In', amount: deductions.basic.noTimeIn || 0 },
                    { description: 'No Time Out', amount: deductions.basic.noTimeOut || 0 }
                ].filter(d => (d.amount || 0) > 0);
                
                if (basicDeductions.length > 0) {
                    // log basic deductions length
                    console.log('Basic deductions:', basicDeductions.length);
                    deductionsY += 10;
                    doc.font(styles.header.font)
                            .fontSize(styles.header.fontSize)
                            .fillColor(styles.header.color)
                            .text('Attendance Deductions', deductionsX + 10, deductionsY - 6);
                    
                    deductionsY += 10;
                    deductionsY = drawTable(
                        doc,
                        ['Description', 'Amount'],
                        basicDeductions.map(d => [d.description, formatCurrency(d.amount)]),
                        [deductionsX, deductionsY, colWidth],
                        styles,
                        [0.6, 0.4]
                    );
                    
                    // Display basic deductions total
                    if (deductions.basic.total) {
                        deductionsY += 5;
                        doc.font(styles.tableCell.font)
                                .fontSize(styles.tableCell.fontSize)
                                .fillColor(styles.tableCell.color);
                        doc.text('Attendance Deductions Total:', deductionsX + 10, deductionsY);
                        doc.text(formatCurrency(deductions.basic.total), deductionsX + colWidth - 80, deductionsY, { width: 70, align: 'right' });
                        deductionsY += 15;
                    }
                }
            }
            
            // Government mandated deductions
            const governmentDeductions = [
                { description: 'SSS Contribution', amount: deductions.governmentMandated.sss || 0 },
                { description: 'PhilHealth', amount: deductions.governmentMandated.philHealth || 0 },
                { description: 'Pag-IBIG', amount: deductions.governmentMandated.pagIbig || 0 },
                { description: 'Withholding Tax', amount: deductions.governmentMandated.withholdingTax || 0 }
            ].filter(item => (item.amount || 0) > 0);
            
            deductionsY = drawTable(
                doc,
                ['Description', 'Amount'],
                governmentDeductions.map(d => [d.description, formatCurrency(d.amount)]),
                [deductionsX, deductionsY, colWidth],
                styles,
                [0.6, 0.4]
            );
            
            // Other deductions if any
            if (deductions.others && deductions.others.length > 0) {
                deductionsY += 10;
                doc.font(styles.header.font)
                     .fontSize(styles.header.fontSize)
                     .fillColor(styles.header.color)
                     .text('Other Deductions', deductionsX + 10, deductionsY);
                
                deductionsY += 15;
                deductionsY = drawTable(
                    doc,
                    ['Description', 'Amount'],
                    deductions.others.map((d: any) => [d.name, formatCurrency(d.amount)]),
                    [deductionsX, deductionsY, colWidth],
                    styles,
                    [0.6, 0.4]
                );
            }
            
            // Total deductions
            deductionsY += 10;
            doc.font(styles.highlight.font)
                 .fontSize(styles.highlight.fontSize)
                 .fillColor(styles.highlight.color);
            doc.text('Total Deductions:', deductionsX + 10, deductionsY);
            doc.text(formatCurrency(payslipData.totals.totalDeductions), deductionsX + colWidth - 100, deductionsY, { width: 90, align: 'right' });

            // Summary Section - Net Pay
            const summaryY = Math.max(currentY, deductionsY) + 20;
            drawFilledRect(doc, 50, summaryY, doc.page.width - 100, 25, '#e6e6e6');
            doc.font(styles.subheader.font)
                 .fontSize(styles.subheader.fontSize)
                 .fillColor(styles.subheader.color)
                 .text('PAYMENT SUMMARY', 50, summaryY + 8, { align: 'center' });
            
            const summaryDetailY = summaryY + 25;

            const netPayBoxY = summaryDetailY;
            
            doc.font(styles.header.font)
                 .fontSize(14)
                 .fillColor('#000')
                 .text('NET PAY', 50, netPayBoxY + 15, { align: 'center' });
            
            doc.font('Helvetica-Bold')
                 .fontSize(18)
                 .fillColor('#000')
                 .text(formatCurrency(payslipData.totals.netPay), 50, netPayBoxY + 35, { align: 'center' });

            // Footer
            const footerY = netPayBoxY + 60;
            drawFilledRect(doc, 50, footerY, doc.page.width - 100, 1, '#cccccc');
            
            doc.font(styles.small.font)
                 .fontSize(styles.small.fontSize)
                 .fillColor(styles.small.color)
                 .text('This is a computer-generated document. No signature is required.', 50, footerY + 10, { align: 'center' })
                 .text(`Generated on: ${new Date().toLocaleString()}`, 50, footerY + 20, { align: 'center' });

            // // Add page numbers
            // const pageCount = doc.bufferedPageRange().count;
            // for (let i = 0; i < pageCount; i++) {
            //     doc.switchToPage(i);
            //     doc.font(styles.small.font)
            //          .fontSize(styles.small.fontSize)
            //          .text(
            //              `Page ${i + 1} of ${pageCount}`,
            //              50,
            //              doc.page.height - 50,
            //              { align: 'right', width: doc.page.width - 100 }
            //          );
            // }

            doc.end();
        } catch (error) {
            console.error('Error generating PDF:', error);
            reject(error);
        }
    });
}

export async function generateMiniPayslipPdf(payslipData: any): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        try {
            // Normalize payslip data with defaults
            payslipData = {
                employee: payslipData.employee || {},
                compensation: payslipData.compensation || {},
                deductions: payslipData.deductions || {},
                rates: payslipData.rates || {},
                totals: payslipData.totals || {},
                allowances: payslipData.allowances || [],
                ...payslipData
            };
            
            // Ensure nested objects within deductions exist
            payslipData.deductions.governmentMandated = payslipData.deductions.governmentMandated || {};
            payslipData.deductions.basic = payslipData.deductions.basic || {};
            payslipData.deductions.others = payslipData.deductions.others || [];

            const buffers: Buffer[] = [];
            
            // Create mini payslip - similar to the image
            const miniWidth = 280;
            const miniHeight = 500; // Taller to fit all items
            
            const doc = new PDFDocument({ 
                margin: 10,
                size: [miniWidth, miniHeight],
                bufferPages: true
            });
            
            // Collect PDF data chunks
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });

            const margin = 15;
            const x = margin;
            let y = margin;
            const availableWidth = miniWidth - (2 * margin);
            
            // Compact styling
            const styles = {
                title: { fontSize: 9, font: 'Helvetica-Bold', color: '#000000' },
                header: { fontSize: 8, font: 'Helvetica-Bold', color: '#000000' },
                normal: { fontSize: 8, font: 'Helvetica', color: '#000000' },
                small: { fontSize: 6, font: 'Helvetica', color: '#666666' }
            };

            // Company header (if needed)
            if (payslipData.employee?.organization) {
                doc.font(styles.title.font)
                   .fontSize(styles.title.fontSize)
                   .text(String(payslipData.employee.organization).toUpperCase(), x, y, { align: 'center' });
                y += 15;
            }
            
            // Period information
            if (payslipData.cutoffPeriod) {
                doc.font(styles.normal.font)
                   .fontSize(styles.normal.fontSize)
                   .text(`Pay Period: ${payslipData.cutoffPeriod}`, x, y);
                y += 10;
            }
            
            if (payslipData.payrollDate) {
                doc.font(styles.normal.font)
                   .fontSize(styles.normal.fontSize)
                   .text(`Pay Date: ${payslipData.payrollDate}`, x, y);
                y += 15;
            }
            
            // Employee information
            const employee = payslipData.employee;
            if (employee) {
                doc.font(styles.normal.font)
                   .fontSize(styles.normal.fontSize);
                   
                if (employee.name) {
                    doc.text(`Employee: ${employee.name}`, x, y);
                    y += 10;
                }
                
                if (employee.position) {
                    doc.text(`Position: ${employee.position}`, x, y);
                    y += 10;
                }
                
                if (employee.department) {
                    doc.text(`Department: ${employee.department}`, x, y);
                    y += 15;
                }
            }

            // Rate information
            doc.font(styles.header.font)
               .fontSize(styles.header.fontSize);
            
            if (payslipData.rates.monthly) {
                doc.text('MONTHLY RATE:', x, y);
                doc.text(formatCurrency(payslipData.rates.monthly).replace('PHP ', ''), availableWidth + x - 70, y, { align: 'right' });
                y += 10;
            }
            
            if (payslipData.rates.daily) {
                doc.text('DAILY RATE:', x, y);
                doc.text(formatCurrency(payslipData.rates.daily).replace('PHP ', ''), availableWidth + x - 70, y, { align: 'right' });
                y += 15;
            }

            // Earnings section
            doc.font(styles.header.font)
               .fontSize(styles.header.fontSize)
               .text('BASIC PAY', x, y);
            y += 10;
               
            // Add earnings items
            doc.font(styles.normal.font)
               .fontSize(styles.normal.fontSize);
            
            const earnings = payslipData.compensation;
            if (earnings.basicPay) {
                doc.text('ADD:', x, y);
                y += 10;
            }
            
            const earningsItems = [
                { name: 'REGULAR OVERTIME', amount: earnings.overtimePay },
                { name: 'REST DAY', amount: earnings.restDayPay },
                { name: 'REST DAY OVERTIME', amount: earnings.restDayOvertimePay },
                { name: 'HOLIDAY PAY', amount: earnings.holidayPay },
                { name: '13TH MONTH', amount: earnings.thirteenthMonthPay },
                { name: 'SPECIAL HOLIDAY PAY', amount: earnings.specialHolidayPay },
                { name: 'SPECIAL HOLIDAY OVERTIME', amount: earnings.specialHolidayOvertimePay },
                { name: 'NIGHT DIFFERENTIAL', amount: earnings.nightDifferentialPay }
            ];

            // Add adjustments as "PAYROLL ADJUSTMENT" if any
            if (earnings.adjustments && earnings.adjustments.length > 0) {
                const adjustmentTotal = earnings.adjustments.reduce((sum: number, adj: any) => sum + (adj.amount || 0), 0);
                earningsItems.push({ name: 'PAYROLL ADJUSTMENT', amount: adjustmentTotal });
            }
            
            // Add tip if applicable
            if (earnings.tip) {
                earningsItems.push({ name: 'TIP', amount: earnings.tip });
            }
            
            // Display attendance deductions as a negative earning under "ABSENCES/UNDERTIME/TARDINESS"
            if (payslipData.deductions.basic && 
                (payslipData.deductions.basic.absences || 
                 payslipData.deductions.basic.tardiness || 
                 payslipData.deductions.basic.undertime)) {
                const attendanceDeductions = (payslipData.deductions.basic.absences || 0) + 
                                             (payslipData.deductions.basic.tardiness || 0) + 
                                             (payslipData.deductions.basic.undertime || 0);
                if (attendanceDeductions > 0) {
                    earningsItems.push({ name: 'ABSENCES/UNDERTIME/TARDINESS', amount: -attendanceDeductions });
                }
            }
            
            // Print earnings items
            earningsItems.forEach(item => {
                if (item.amount) {
                    doc.text(item.name, x + 10, y);
                    if (item.amount < 0) {
                        // For negative amounts (like deductions), use parentheses
                        doc.text(`(${formatCurrency(Math.abs(item.amount)).replace('PHP ', '')})`, availableWidth + x - 70, y, { align: 'right' });
                    } else {
                        doc.text(formatCurrency(item.amount).replace('PHP ', ''), availableWidth + x - 70, y, { align: 'right' });
                    }
                    y += 10;
                }
            });

            // Gross pay
            doc.font(styles.header.font)
               .fontSize(styles.header.fontSize);
            
            y += 5;
            doc.text('GROSS PAY', x, y);
            doc.text(formatCurrency(payslipData.totals.grossPay).replace('PHP ', ''), availableWidth + x - 70, y, { align: 'right' });
            y += 15;

            // Deductions section
            doc.font(styles.header.font)
               .fontSize(styles.header.fontSize)
               .text('LESS:', x, y);
            y += 10;
            
            doc.font(styles.normal.font)
               .fontSize(styles.normal.fontSize);
            
            // Government mandated deductions
            const deductionItems = [
                { name: 'WITHHOLDING TAX', amount: payslipData.deductions.governmentMandated.withholdingTax },
                { name: 'SSS PREMIUM', amount: payslipData.deductions.governmentMandated.sss },
                { name: 'PHIL. HEALTH', amount: payslipData.deductions.governmentMandated.philHealth },
                { name: 'PAG-IBIG', amount: payslipData.deductions.governmentMandated.pagIbig }
            ];

            // Add other deductions
            if (payslipData.deductions.others && payslipData.deductions.others.length > 0) {
                payslipData.deductions.others.forEach((deduction: any) => {
                    deductionItems.push({ 
                        name: deduction.name.toUpperCase(), 
                        amount: deduction.amount 
                    });
                });
            }
            
            // Print deduction items
            deductionItems.forEach(item => {
                if (item.amount) {
                    doc.text(item.name, x + 10, y);
                    doc.text(formatCurrency(item.amount).replace('PHP ', ''), availableWidth + x - 70, y, { align: 'right' });
                    y += 10;
                }
            });

            // Total deductions
            y += 5;
            doc.font(styles.header.font)
               .fontSize(styles.header.fontSize)
               .text('TOTAL DEDUCTIONS', x, y);
            doc.text(formatCurrency(payslipData.totals.totalDeductions).replace('PHP ', ''), availableWidth + x - 70, y, { align: 'right' });
            y += 15;

            // Allowances section if any
            if (payslipData.allowances && payslipData.allowances.length > 0) {
                const allowanceItems = payslipData.allowances.map((allowance: any) => ({
                    name: allowance.name.toUpperCase(),
                    amount: allowance.amount
                }));
                
                // Print allowance items
                allowanceItems.forEach((item: any)=> {
                    doc.font(styles.normal.font)
                       .fontSize(styles.normal.fontSize)
                       .text(item.name, x + 10, y);
                    doc.text(formatCurrency(item.amount).replace('PHP ', ''), availableWidth + x - 70, y, { align: 'right' });
                    y += 10;
                });
                
                // Total allowances
                y += 5;
                doc.font(styles.header.font)
                   .fontSize(styles.header.fontSize)
                   .text('TOTAL ALLOWANCES', x, y);
                   
                const totalAllowances = payslipData.totals.totalAllowances || 
                    payslipData.allowances.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
                    
                doc.text(formatCurrency(totalAllowances).replace('PHP ', ''), availableWidth + x - 70, y, { align: 'right' });
                y += 15;
            }

            // Net pay
            doc.font(styles.header.font)
               .fontSize(styles.header.fontSize)
               .text('NET PAY', x, y);
            doc.text(formatCurrency(payslipData.totals.netPay).replace('PHP ', ''), availableWidth + x - 70, y, { align: 'right' });
            y += 20;

            // Received by
            doc.font(styles.header.font)
               .fontSize(styles.header.fontSize)
               .text('RECEIVED BY:', x, y);
            y += 20;
            
            // Signature line
            doc.lineWidth(0.5)
               .moveTo(x, y)
               .lineTo(x + 150, y)
               .stroke();
            
            // Accounting Copy
            y += 5;
            doc.font(styles.normal.font)
               .fontSize(styles.normal.fontSize)
               .text('Accounting Copy', x, y);
               
            doc.end();
        } catch (error) {
            console.error('Error generating mini payslip:', error);
            reject(error);
        }
    });
}

// Helper functions for drawing elements
function drawOutlinedRect(doc: PDFKit.PDFDocument, x: number, y: number, width: number, height: number, lineWidth: number = 1): void {
    doc.lineWidth(lineWidth)
         .rect(x, y, width, height)
         .stroke();
}

function drawFilledRect(doc: PDFKit.PDFDocument, x: number, y: number, width: number, height: number, color: string): void {
    doc.fillColor(color)
         .rect(x, y, width, height)
         .fill();
}

function drawInfoBox(doc: PDFKit.PDFDocument, label: string, value: string, x: number, y: number, width: number): void {
    drawOutlinedRect(doc, x, y, width, 40);
    
    doc.font('Helvetica')
         .fontSize(8)
         .fillColor('#666666')
         .text(label, x + 5, y + 5);
    
    doc.font('Helvetica-Bold')
         .fontSize(12)
         .fillColor('#000000')
         .text(value, x + 5, y + 20);
}

function drawTable(
    doc: PDFKit.PDFDocument,
    headers: string[],
    rows: string[][],
    position: [number, number, number], // [x, y, width]
    styles: any,
    columnRatios?: number[] // Optional column width ratios
): number {
    const [x, y, width] = position;
    const colWidths = columnRatios
        ? columnRatios.map(ratio => width * ratio)
        : calculateColumnWidths(width, headers.length);
    
    let startX = x;
    let startY = y;
    
    // Draw table header
    const headerHeight = 20;
    drawFilledRect(doc, x, y, width, headerHeight, '#e6e6e6');
    doc.font(styles.tableHeader.font)
         .fontSize(styles.tableHeader.fontSize)
         .fillColor(styles.tableHeader.color);
    
    headers.forEach((header, i) => {
        const align = i === headers.length - 1 ? 'right' : 'left';
        const padding = i === headers.length - 1 ? 10 : 10;
        doc.text(header, startX + padding, startY + 6, { 
            width: colWidths[i] - (padding * 2), 
            align 
        });
        startX += colWidths[i];
    });
    
    // Draw horizontal line after header
    doc.lineWidth(0.5)
         .moveTo(x, y + headerHeight)
         .lineTo(x + width, y + headerHeight)
         .stroke();
    
    startY += headerHeight;
    
    // Draw rows with dynamic heights
    doc.font(styles.tableCell.font)
         .fontSize(styles.tableCell.fontSize)
         .fillColor(styles.tableCell.color);
    
    rows.forEach((row, rowIndex) => {
        // Calculate row height based on content
        let rowHeight = 20; // minimum height
        let cellHeights: any = [];
        
        // Calculate height needed for each cell in this row
        row.forEach((cell, i) => {
            const textOptions = {
                width: colWidths[i] - 20, // 10px padding on each side
                align: (i === row.length - 1 ? 'right' : 'left') as 'right' | 'left'
            };
            
            // Calculate height without actually rendering
            const textHeight = doc.heightOfString(cell, textOptions);
            cellHeights.push(Math.max(20, textHeight + 12)); // Add padding
        });
        
        // Row height is the maximum of all cell heights in this row
        rowHeight = Math.max(...cellHeights);
        
        // Draw row background

        startX = x;
        row.forEach((cell, i) => {
            const align = i === row.length - 1 ? 'right' : 'left';
            const padding = i === row.length - 1 ? 10 : 10;
            
            doc.text(cell, startX + padding, startY + 6, { 
                width: colWidths[i] - (padding * 2), 
                align 
            });
            startX += colWidths[i];
        });
        
        startY += rowHeight;
    });
    
    // Draw bottom border
    doc.lineWidth(0.5)
         .moveTo(x, startY)
         .lineTo(x + width, startY)
         .stroke();
    
    return startY;
}

function calculateColumnWidths(totalWidth: number, columnCount: number): number[] {
    if (columnCount === 2) {
        // For 2 columns, make first one wider (70%)
        return [
            totalWidth * 0.7,
            totalWidth * 0.3
        ];
    } else if (columnCount === 3) {
        // For 3 columns (e.g., description, hours, amount)
        return [
            totalWidth * 0.6,
            totalWidth * 0.2,
            totalWidth * 0.2
        ];
    }
    
    // Default: equal widths
    const width = totalWidth / columnCount;
    return new Array(columnCount).fill(width);
}

function formatCurrency(amount: number): string {
    const value = amount || 0;
    // Format the number without currency symbol first
    const formatter = new Intl.NumberFormat('en-PH', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    // Then add the peso symbol manually
    return `\u20B1${formatter.format(value)}`;
}