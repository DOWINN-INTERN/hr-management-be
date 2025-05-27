// import { RuleOperator } from '@/common/enums/compliance/rule-operator.enum';
// import { ViolationSeverity } from '@/common/enums/compliance/violation-severity.enum';
// import { AttendancesService } from '@/modules/attendance-management/attendances.service';
// import { Attendance } from '@/modules/attendance-management/entities/attendance.entity';
// import { FinalWorkHoursService } from '@/modules/attendance-management/final-work-hours/final-work-hours.service';
// import { Employee } from '@/modules/employee-management/entities/employee.entity';
// import { Injectable, Logger } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { DataSource, Repository } from 'typeorm';
// import { Policy } from '../../policies/entities/policy.entity';
// import { PoliciesService } from '../../policies/policies.service';
// import { Violation } from '../../violations/entities/violation.entity';
// import { Rule } from '../entities/rule.entity';

// @Injectable()
// export class RulesEngineService {
//   private readonly logger = new Logger(RulesEngineService.name);

//   constructor(
//     private readonly policiesService: PoliciesService,
//     @InjectRepository(Violation)
//     private readonly violationsRepository: Repository<Violation>,
//     private readonly attendancesService: AttendancesService,
//     private readonly finalWorkHoursService: FinalWorkHoursService
//   ) {}

//   /**
//    * Evaluate a specific policy against employee data
//    */
//   async evaluatePolicy(
//     policy: Policy, 
//     employee: Employee, 
//     contextData?: any
//   ): Promise<{ 
//     violated: boolean; 
//     violations: Array<{ rule: Rule; details: any }> 
//   }> {
//     const violations: Array<{ rule: Rule; details: any }> = [];
//     let violatedRulesCount = 0;

//     // Load additional context data if needed
//     const context = await this.buildEvaluationContext(employee, policy, contextData);

//     // Evaluate each rule in the policy
//     for (const rule of policy.rules) {
//       const result = await this.evaluateRule(rule, context);
//       if (!result.compliant) {
//         violatedRulesCount++;
//         violations.push({
//           rule,
//           details: result.details
//         });
//       }
//     }

//     // Determine if policy is violated based on threshold
//     const violated = violatedRulesCount > 0;

//     return { violated, violations };
//   }

//   /**
//    * Evaluate all active policies for a specific employee and record violations
//    */
//   async evaluateAllPoliciesForEmployee(
//     employee: Employee,
//     contextData?: any
//   ): Promise<Violation[]> {
//     const allPolicies = await this.policiesService.getRepository().find({ 
//       where: { isActive: true },
//       relations: ['rules', 'template']
//     });
    
//     const violations: Violation[] = [];
    
//     for (const policy of allPolicies) {
//       const { violated, violations: ruleViolations } = await this.evaluatePolicy(policy, employee, contextData);
      
//       if (violated) {
//         const violation = this.violationsRepository.create({
//           policy,
//           employee,
//           violationDate: new Date(),
//           violationDetails: {
//             ruleViolations: ruleViolations.map(v => ({
//               ruleName: v.rule.name,
//               errorMessage: v.rule.errorMessage || `Violation of rule: ${v.rule.name}`,
//               details: v.details
//             }))
//           },
//           severity: this.determineSeverity(ruleViolations)
//         });
        
//         await this.violationsRepository.save(violation);
//         violations.push(violation);
//       }
//     }
    
//     return violations;
//   }

//   /**
//    * Evaluate a specific rule against context data
//    */
//   private async evaluateRule(
//     rule: Rule, 
//     context: any
//   ): Promise<{ compliant: boolean; details?: any }> {
//     try {
//       // Get the value from context based on data path
//       const actualValue = this.getValueFromPath(context, rule.dataPath);
      
//       // Evaluate based on operator
//       switch (rule.operator) {
//         case RuleOperator.EQUALS:
//           return { 
//             compliant: actualValue === rule.value,
//             details: { actualValue, expectedValue: rule.value }
//           };
//         case RuleOperator.NOT_EQUALS:
//           return { 
//             compliant: actualValue !== rule.value,
//             details: { actualValue, expectedValue: rule.value }
//           };
//         case RuleOperator.GREATER_THAN:
//           return { 
//             compliant: actualValue > rule.value,
//             details: { actualValue, threshold: rule.value }
//           };
//         case RuleOperator.LESS_THAN:
//           return { 
//             compliant: actualValue < rule.value,
//             details: { actualValue, threshold: rule.value }
//           };
//         case RuleOperator.BETWEEN:
//           return { 
//             compliant: actualValue >= rule.value[0] && actualValue <= rule.value[1],
//             details: { actualValue, range: rule.value }
//           };
//         // Additional operators implementation...
//         default:
//           this.logger.warn(`Unsupported operator: ${rule.operator}`);
//           return { compliant: true };
//       }
//     } catch (error: any) {
//       this.logger.error(`Error evaluating rule ${rule.name}: ${error.message}`);
//       return { compliant: true }; // Fail open for rule evaluation errors
//     }
//   }

//   /**
//    * Build the evaluation context by loading relevant data
//    */
//   private async buildEvaluationContext(
//     employee: Employee,
//     policy: Policy,
//     providedContext?: any
//   ): Promise<any> {
//     // Start with provided context and employee data
//     const context = {
//       employee: {
//         id: employee.id,
//         firstName: employee.firstName,
//         lastName: employee.lastName,
//         // Add other employee fields as needed
//       },
//       ...providedContext
//     };
    
//     // Load additional data based on policy data sources
//     const dataSources = new Set(policy.rules.map(rule => rule.dataSource));
    
//     if (dataSources.has(DataSource.ATTENDANCE)) {
//       // Get recent attendance data
//       const recentAttendance = await this.attendancesService.findBy({
//         employee: { id: employee.id }
//       });
//       context.attendance = this.aggregateAttendanceMetrics(recentAttendance);
//     }
    
//     if (dataSources.has(DataSource.WORK_HOURS)) {
//       // Get work hours data
//       const workHours = await this.finalWorkHoursService.findBy({
//         employee: { id: employee.id }
//       });
//       context.workHours = this.aggregateWorkHoursMetrics(workHours);
//     }
    
//     return context;
//   }

//   /**
//    * Aggregate attendance data into useful metrics
//    */
//   private aggregateAttendanceMetrics(attendances: Attendance[]): any {
//     // Calculate metrics like late count, absence count, etc.
//     const lateCount = attendances.filter(a => a.isLate).length;
//     const absenceCount = attendances.filter(a => a.isAbsent).length;
//     // Other metrics...
    
//     return {
//       lateCount,
//       absenceCount,
//       totalRecords: attendances.length,
//       // Other metrics...
//     };
//   }

//   /**
//    * Aggregate work hours data into useful metrics
//    */
//   private aggregateWorkHoursMetrics(workHours: any[]): any {
//     // Calculate metrics like overtime hours, undertime hours, etc.
//     const totalHours = workHours.reduce((sum, wh) => sum + wh.hoursWorked, 0);
//     const overtimeHours = workHours.reduce((sum, wh) => sum + (wh.overtimeHours || 0), 0);
    
//     return {
//       totalHours,
//       overtimeHours,
//       recordCount: workHours.length,
//       // Other metrics...
//     };
//   }

//   /**
//    * Get a value from a nested object using a path string
//    */
//   private getValueFromPath(obj: any, path: string): any {
//     return path.split('.').reduce((o, i) => o[i], obj);
//   }

//   /**
//    * Determine violation severity based on violated rules
//    */
//   private determineSeverity(violations: Array<{ rule: Rule; details: any }>): ViolationSeverity {
//     // Logic to determine severity based on rule weights, counts, etc.
//     const totalWeight = violations.reduce((sum, v) => sum + v.rule.weight, 0);
    
//     if (totalWeight >= 10) return ViolationSeverity.CRITICAL;
//     if (totalWeight >= 7) return ViolationSeverity.HIGH;
//     if (totalWeight >= 4) return ViolationSeverity.MEDIUM;
//     return ViolationSeverity.LOW;
//   }
// }