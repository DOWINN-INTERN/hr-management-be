export enum CutoffStatus {
    ACTIVE = 'ACTIVE', // The cutoff period is currently active
    INACTIVE = 'INACTIVE', // The cutoff period is not active
    COMPLETED = 'COMPLETED', // The cutoff period has been completed
    PENDING = 'PENDING', // The cutoff period is pending
    PROCESSING = 'PROCESSING', // The cutoff period is currently being processed
    CANCELLED = 'CANCELLED', // The cutoff period has been cancelled
}