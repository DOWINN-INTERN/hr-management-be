// import { PolicyCategory } from '@/common/enums/compliance/policy-category.enum';
// import { Decision } from '@/common/enums/decision.enum';
// import { MemoStatus } from '@/common/enums/memo-status.enum';
// import { TransactionService } from '@/common/services/transaction.service';
// import { EmployeesService } from '@/modules/employee-management/employees.service';
// import { Employee } from '@/modules/employee-management/entities/employee.entity';
// import { NotificationsService } from '@/modules/notifications/notifications.service';
// import { Injectable, Logger } from '@nestjs/common';
// import { Policy } from '../../policies/entities/policy.entity';
// import { Violation } from '../../violations/entities/violation.entity';
// import { Memorandum } from '../entities/memorandum.entity';
// import { MemorandumFlow } from '../memorandum-flows/entities/memorandum-flow.entity';
// import { MemorandumFlowsService } from '../memorandum-flows/memorandum-flows.service';
// import { MemorandumRecipient } from '../memorandum-recipients/entities/memorandum-recipient.entity';
// import { MemorandumRecipientsService } from '../memorandum-recipients/memorandum-recipients.service';
// import { MemorandumsService } from '../memorandums.service';

// @Injectable()
// export class MemorandumGeneratorService {
//   private readonly logger = new Logger(MemorandumGeneratorService.name);

//   constructor(
//     private readonly memorandumsService: MemorandumsService,
//     private readonly recipientsService: MemorandumRecipientsService,
//     private readonly flowsService: MemorandumFlowsService,
//     private readonly transactionService: TransactionService,
//     private readonly notificationsService: NotificationsService,
//     private readonly employeesService: EmployeesService,
//   ) {}

//   /**
//    * Generate a memorandum for a compliance violation
//    */
//   async generateMemoForViolation(
//     violation: Violation,
//     issuerId: string
//   ): Promise<Memorandum> {
//     return this.transactionService.executeInTransaction(async (queryRunner) => {
//       const { policy, employee } = violation;
      
//       // Get template from policy or use default
//       const templateContent = policy.template ? policy.template.content : this.getDefaultTemplate(policy.category);
      
//       // Process template with violation details
//       const processedContent = this.processTemplate(templateContent, {
//         employee,
//         policy,
//         violation
//       });

//       // Determine approvers based on policy configuration
//       const approvers = await this.determineApprovers(policy, employee);

//       // Create memorandum
//       const memorandum = queryRunner.manager.create(Memorandum, {
//         title: `${policy.name} Violation - ${employee.firstName} ${employee.lastName}`,
//         content: processedContent,
//         type: policy.memoType,
//         status: MemoStatus.DRAFT,
//         issuer: { id: issuerId }, // HR or manager issuing the memo
//         template: policy.template,
//         effectiveDate: new Date(),
//         complianceDate: this.calculateComplianceDate(policy)
//       });
      
//       const savedMemorandum = await queryRunner.manager.save(Memorandum, memorandum);
      
//       // Create recipient
//       const recipient = queryRunner.manager.create(MemorandumRecipient, {
//         memorandum: savedMemorandum,
//         employee: employee,
//         read: false,
//         acknowledged: false
//       });
//       await queryRunner.manager.save(MemorandumRecipient, recipient);
      
//       // Create approval flows
//       const flows = approvers.map((approver, index) => {
//         return queryRunner.manager.create(MemorandumFlow, {
//           memorandum: savedMemorandum,
//           approver: approver,
//           sequence: index + 1,
//           decision: Decision.PENDING
//         });
//       });
//       await queryRunner.manager.save(MemorandumFlow, flows);
      
//       // Update the violation to link it to the memorandum
//       violation.memorandum = savedMemorandum;
//       await queryRunner.manager.save(Violation, violation);
      
//       // Create notifications for relevant parties
//       await this.notifyRelevantParties(savedMemorandum, employee, approvers);
      
//       return savedMemorandum;
//     });
//   }
  
//   /**
//    * Generate memorandums for multiple violations
//    */
//   async batchGenerateMemos(
//     violations: Violation[],
//     issuerId: string
//   ): Promise<Memorandum[]> {
//     const results: Memorandum[] = [];
    
//     for (const violation of violations) {
//       if (violation.policy.autoGenerateMemo) {
//         try {
//           const memo = await this.generateMemoForViolation(violation, issuerId);
//           results.push(memo);
//         } catch (error) {
//           this.logger.error(`Failed to generate memo for violation ${violation.id}: ${error.message}`);
//         }
//       }
//     }
    
//     return results;
//   }

//   /**
//    * Process a template with dynamic data
//    */
//   private processTemplate(template: string, data: any): string {
//     let result = template;
    
//     // Replace {{employee.firstName}}, {{policy.name}}, etc.
//     result = result.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
//       try {
//         const value = path.split('.').reduce((o: any, p: any) => o ? o[p] : undefined, data);
//         return value !== undefined ? value : match;
//       } catch (e) {
//         return match; // Keep original placeholder if error
//       }
//     });
    
//     return result;
//   }

//   /**
//    * Determine approvers based on policy configuration
//    */
//   private async determineApprovers(policy: Policy, employee: Employee): Promise<Employee[]> {
//     let approvers: Employee[] = [];
    
//     if (policy.escalationPath) {
//       const escalationConfig = JSON.parse(policy.escalationPath);
      
//       // Logic to determine approvers based on configuration
//       if (escalationConfig.useDirectManager) {
//         const manager = await this.employeesService.findOneBy({ id: employee.managerId });
//         if (manager) approvers.push(manager);
//       }
      
//       if (escalationConfig.roles) {
//         for (const role of escalationConfig.roles) {
//           const employees = await this.employeesService.findByRoleName(role);
//           approvers = [...approvers, ...employees];
//         }
//       }
//     }
    
//     // Default to HR personnel if no approvers found
//     if (approvers.length === 0) {
//       const hrStaff = await this.employeesService.findByRoleName('HR Manager');
//       approvers = hrStaff;
//     }
    
//     return approvers;
//   }

//   /**
//    * Calculate compliance date based on policy configuration
//    */
//   private calculateComplianceDate(policy: Policy): Date {
//     const date = new Date();
//     date.setDate(date.getDate() + (policy.complianceDays || 7)); // Default 7 days
//     return date;
//   }

//   /**
//    * Notify relevant parties about the new memorandum
//    */
//   private async notifyRelevantParties(
//     memo: Memorandum,
//     employee: Employee,
//     approvers: Employee[]
//   ): Promise<void> {
//     // Notify the employee
//     await this.notificationsService.create({
//       title: `New Memorandum: ${memo.title}`,
//       message: `You have received a new memorandum regarding ${memo.type.toLowerCase()}.`,
//       type: 'MEMORANDUM',
//       status: 'UNREAD',
//       priority: 'HIGH',
//       metadata: {
//         memorandumId: memo.id
//       },
//       user: employee.user
//     });
    
//     // Notify approvers
//     for (const approver of approvers) {
//       await this.notificationsService.create({
//         title: `Memorandum Approval Required`,
//         message: `Your approval is needed for a memorandum issued to ${employee.firstName} ${employee.lastName}.`,
//         type: 'APPROVAL_REQUEST',
//         status: 'UNREAD',
//         priority: 'MEDIUM',
//         metadata: {
//           memorandumId: memo.id
//         },
//         user: approver.user
//       });
//     }
//   }
  
//   /**
//    * Get a default template for a policy category
//    */
//   private getDefaultTemplate(category: PolicyCategory): string {
//     const templates = {
//       [PolicyCategory.ATTENDANCE]: `
// Dear {{employee.firstName}} {{employee.lastName}},

// This memorandum is to inform you of a violation of our attendance policy: {{policy.name}}.

// Details of the violation:
// - Date: {{violation.violationDate}}
// - Specific issues: {{violation.violationDetails.ruleViolations[0].errorMessage}}

// Please acknowledge receipt of this memorandum and take immediate steps to address this issue.

// Regards,
// Human Resources Department
//       `,
//       // Additional templates for other categories...
//     };
    
//     return templates[category] || templates[PolicyCategory.OTHER];
//   }
// }