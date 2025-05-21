export enum PayrollState {
  DRAFT = 'DRAFT',     // Initial creation state
  CALCULATING = 'CALCULATING',  // Processing in progress
  PENDING_APPROVAL = 'PENDING_APPROVAL',  // Ready for review
  APPROVED = 'APPROVED',  // Approved but not yet paid
  PAID = 'PAID',       // Payment distributed
  ARCHIVED = 'ARCHIVED',  // Finalized for record keeping
  FAILED = 'FAILED',    // Error state
  REJECTED = 'REJECTED',  // Explicitly rejected by approver
  CANCELLED = 'CANCELLED',  // Cancelled mid-process
  VOID = 'VOID',      // Marked as void
}