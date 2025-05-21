import { PayrollState } from '@/common/enums/payroll/payroll-state.enum';
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
    // Only draft payrolls can be calculated
    if (payroll.state !== PayrollState.DRAFT) {
      this.logger.warn(`Cannot start calculation for payroll ${payroll.id} in state ${payroll.state}`);
      return false;
    }

    // Initialize state history if not exists
    if (!payroll.stateHistory) {
      payroll.stateHistory = [];
    }

    // Record state transition
    payroll.stateHistory.push({
      from: PayrollState.DRAFT,
      to: PayrollState.CALCULATING,
      timestamp: new Date(),
    });

    payroll.state = PayrollState.CALCULATING;
    return true;
  }
  
  /**
   * Complete calculation and move to pending approval
   */
  completeCalculation(payroll: Payroll): boolean {
    if (payroll.state !== PayrollState.CALCULATING) {
      this.logger.warn(`Cannot complete calculation for payroll ${payroll.id} in state ${payroll.state}`);
      return false;
    }

    // Record state transition
    payroll.stateHistory?.push({
      from: PayrollState.CALCULATING,
      to: PayrollState.PENDING_APPROVAL,
      timestamp: new Date(),
    });

    payroll.state = PayrollState.PENDING_APPROVAL;
    return true;
  }
  
  /**
   * Approve the payroll
   */
  approve(payroll: Payroll, approvedBy: string): boolean {
    if (payroll.state !== PayrollState.PENDING_APPROVAL) {
      this.logger.warn(`Cannot approve payroll ${payroll.id} in state ${payroll.state}`);
      return false;
    }

    // Record state transition
    payroll.stateHistory?.push({
      from: PayrollState.PENDING_APPROVAL,
      to: PayrollState.APPROVED,
      timestamp: new Date(),
      note: `Approved by ${approvedBy}`,
    });

    payroll.state = PayrollState.APPROVED;
    payroll.approvedAt = new Date();
    payroll.approvedBy = approvedBy;
    return true;
  }

  /**
   * Reject the payroll
   */
  reject(payroll: Payroll, rejectedBy: string, reason: string): boolean {
    if (payroll.state !== PayrollState.PENDING_APPROVAL) {
      this.logger.warn(`Cannot reject payroll ${payroll.id} in state ${payroll.state}`);
      return false;
    }

    // Record state transition
    payroll.stateHistory?.push({
      from: PayrollState.PENDING_APPROVAL,
      to: PayrollState.REJECTED,
      timestamp: new Date(),
      note: `Rejected by ${rejectedBy}: ${reason}`,
    });

    payroll.state = PayrollState.REJECTED;
    payroll.rejectedAt = new Date();
    payroll.rejectedBy = rejectedBy;
    payroll.rejectionReason = reason;
    return true;
  }

  /**
   * Void the payroll
   */
  void(payroll: Payroll, voidedBy: string): boolean {
    // Check if the payroll is already voided
    if (payroll.state === PayrollState.VOID) {
      this.logger.warn(`Cannot void payroll ${payroll.id} as it is already voided`);
      return false;
    }

    // Record state transition
    payroll.stateHistory?.push({
      from: payroll.state, // Use current state instead of hardcoded PAID
      to: PayrollState.VOID,
      timestamp: new Date(),
      note: `Voided by ${voidedBy}`,
    });
    
    payroll.state = PayrollState.VOID;
    payroll.voidedAt = new Date();
    payroll.voidedBy = voidedBy;
    return true;
  }
  
  /**
   * Mark the payroll as paid
   */
  markPaid(payroll: Payroll, releasedBy: string, paymentDetails?: any): boolean {
    if (payroll.state !== PayrollState.APPROVED) {
      this.logger.warn(`Cannot mark payroll ${payroll.id} as paid in state ${payroll.state}`);
      return false;
    }

    // Record state transition with payment details
    payroll.stateHistory?.push({
      from: PayrollState.APPROVED,
      to: PayrollState.PAID,
      timestamp: new Date(),
      note: `Released by ${releasedBy}`,
      details: paymentDetails || {},
    });

    payroll.state = PayrollState.PAID;
    payroll.releasedAt = new Date();
    payroll.releasedBy = releasedBy;
    return true;
  }
  
  /**
   * Archive the payroll
   */
  archive(payroll: Payroll): boolean {
    if (payroll.state !== PayrollState.PAID) {
      this.logger.warn(`Cannot archive payroll ${payroll.id} in state ${payroll.state}`);
      return false;
    }

    // Record state transition
    payroll.stateHistory?.push({
      from: PayrollState.PAID,
      to: PayrollState.ARCHIVED,
      timestamp: new Date(),
    });

    payroll.state = PayrollState.ARCHIVED;
    return true;
  }
  
  /**
   * Mark the payroll as failed
   */
  markFailed(payroll: Payroll, reason: string): void {
    // Any state can fail
    payroll.stateHistory?.push({
      from: payroll.state,
      to: PayrollState.FAILED,
      timestamp: new Date(),
      note: reason,
    });

    payroll.state = PayrollState.FAILED;
  }
  
  /**
   * Reset the payroll to draft state for reprocessing
   */
  resetToDraft(payroll: Payroll, reason: string): boolean {
    // Only failed or pending approval payrolls can be reset
    const allowedStates = [
      PayrollState.FAILED,
      PayrollState.PENDING_APPROVAL,
      PayrollState.REJECTED
    ];
    
    if (!allowedStates.includes(payroll.state)) {
      this.logger.warn(`Cannot reset payroll ${payroll.id} in state ${payroll.state}`);
      return false;
    }

    // Record state transition
    payroll.stateHistory?.push({
      from: payroll.state,
      to: PayrollState.DRAFT,
      timestamp: new Date(),
      note: reason,
    });

    payroll.state = PayrollState.DRAFT;
    payroll.reprocessedCount += 1;
    return true;
  }
}