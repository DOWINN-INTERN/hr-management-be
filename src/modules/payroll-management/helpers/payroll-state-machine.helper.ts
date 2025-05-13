import { PayrollProcessingState } from '@/common/enums/payroll-processing-state.enum';
import { Injectable, Logger } from '@nestjs/common';
import { Payroll } from '../entities/payroll.entity';

/**
 * Manages the state transitions for payroll processing to ensure
 * consistency and prevent invalid state transitions
 */
@Injectable()
export class PayrollStateMachine {
  private readonly logger = new Logger(PayrollStateMachine.name);
  
  /**
   * Start the calculation process for a payroll
   */
  startCalculation(payroll: Payroll): boolean {
    if (payroll.processingState === PayrollProcessingState.DRAFT) {
      payroll.processingState = PayrollProcessingState.CALCULATING;
      payroll.stateHistory = [
        ...payroll.stateHistory || [],
        {
          from: PayrollProcessingState.DRAFT,
          to: PayrollProcessingState.CALCULATING,
          timestamp: new Date(),
          note: 'Calculation started'
        }
      ];
      return true;
    }
    
    this.logger.warn(`Cannot start calculation for payroll ${payroll.id}: Invalid state ${payroll.processingState}`);
    return false;
  }
  
  /**
   * Complete calculation and move to pending approval
   */
  completeCalculation(payroll: Payroll): boolean {
    if (payroll.processingState === PayrollProcessingState.CALCULATING) {
      payroll.processingState = PayrollProcessingState.PENDING_APPROVAL;
      payroll.stateHistory = [
        ...payroll.stateHistory || [],
        {
          from: PayrollProcessingState.CALCULATING,
          to: PayrollProcessingState.PENDING_APPROVAL,
          timestamp: new Date(),
          note: 'Calculation completed'
        }
      ];
      return true;
    }
    
    this.logger.warn(`Cannot complete calculation for payroll ${payroll.id}: Invalid state ${payroll.processingState}`);
    return false;
  }
  
  /**
   * Approve the payroll
   */
  approve(payroll: Payroll, approvedBy: string): boolean {
    if (payroll.processingState === PayrollProcessingState.PENDING_APPROVAL) {
      payroll.processingState = PayrollProcessingState.APPROVED;
      payroll.approvedAt = new Date();
      payroll.approvedBy = approvedBy;
      payroll.stateHistory = [
        ...payroll.stateHistory || [],
        {
          from: PayrollProcessingState.PENDING_APPROVAL,
          to: PayrollProcessingState.APPROVED,
          timestamp: new Date(),
          note: `Approved by ${approvedBy}`
        }
      ];
      return true;
    }
    
    this.logger.warn(`Cannot approve payroll ${payroll.id}: Invalid state ${payroll.processingState}`);
    return false;
  }
  
  /**
   * Mark the payroll as paid
   */
  markPaid(payroll: Payroll, releasedBy: string, paymentDetails?: any): boolean {
    if (payroll.processingState === PayrollProcessingState.APPROVED) {
      payroll.processingState = PayrollProcessingState.PAID;
      payroll.releasedAt = new Date();
      payroll.releasedBy = releasedBy;
      
      // Set payment details if provided
      if (paymentDetails) {
        payroll.paymentMethod = paymentDetails.method;
        payroll.bankAccount = paymentDetails.bankAccount;
        payroll.checkNumber = paymentDetails.checkNumber;
        payroll.bankReferenceNumber = paymentDetails.referenceNumber;
        payroll.paymentDate = new Date();
      }
      
      payroll.stateHistory = [
        ...payroll.stateHistory || [],
        {
          from: PayrollProcessingState.APPROVED,
          to: PayrollProcessingState.PAID,
          timestamp: new Date(),
          note: `Released by ${releasedBy}`,
          details: paymentDetails
        }
      ];
      return true;
    }
    
    this.logger.warn(`Cannot mark payroll ${payroll.id} as paid: Invalid state ${payroll.processingState}`);
    return false;
  }
  
  /**
   * Archive the payroll
   */
  archive(payroll: Payroll): boolean {
    if (payroll.processingState === PayrollProcessingState.PAID) {
      payroll.processingState = PayrollProcessingState.ARCHIVED;
      payroll.stateHistory = [
        ...payroll.stateHistory || [],
        {
          from: PayrollProcessingState.PAID,
          to: PayrollProcessingState.ARCHIVED,
          timestamp: new Date(),
          note: 'Archived'
        }
      ];
      return true;
    }
    
    this.logger.warn(`Cannot archive payroll ${payroll.id}: Invalid state ${payroll.processingState}`);
    return false;
  }
  
  /**
   * Mark the payroll as failed
   */
  markFailed(payroll: Payroll, reason: string): void {
    payroll.processingState = PayrollProcessingState.FAILED;
    payroll.stateHistory = [
      ...payroll.stateHistory || [],
      {
        from: payroll.processingState,
        to: PayrollProcessingState.FAILED,
        timestamp: new Date(),
        note: `Failed: ${reason}`
      }
    ];
    
    this.logger.error(`Payroll ${payroll.id} marked as failed: ${reason}`);
  }
  
  /**
   * Reset the payroll to draft state for reprocessing
   */
  resetToDraft(payroll: Payroll, reason: string): boolean {
    if (payroll.processingState !== PayrollProcessingState.PAID && 
        payroll.processingState !== PayrollProcessingState.ARCHIVED) {
      payroll.processingState = PayrollProcessingState.DRAFT;
      payroll.stateHistory = [
        ...payroll.stateHistory || [],
        {
          from: payroll.processingState,
          to: PayrollProcessingState.DRAFT,
          timestamp: new Date(),
          note: `Reset to draft: ${reason}`
        }
      ];
      return true;
    }
    
    this.logger.warn(`Cannot reset payroll ${payroll.id} to draft: Already paid or archived`);
    return false;
  }
}