export enum ScheduleChangeRequestType {
    // Request for general time off from scheduled work
    TIME_OFF = 'TIME_OFF',
    
    // Request to modify the timing or duration of an existing shift
    SHIFT_CHANGE = 'SHIFT_CHANGE',
    
    // Request to work beyond regular scheduled hours
    OVERTIME = 'OVERTIME',
    
    // Request for time off due to illness or medical reasons
    SICK_LEAVE = 'SICK_LEAVE',

    // Request for time off for personal reasons
    PERSONAL_LEAVE = 'PERSONAL_LEAVE',

    // Request for time off due to bereavement or loss
    BEREAVEMENT = 'BEREAVEMENT',

    // Request for time off for maternity or paternity leave
    MATERNITY_PATERNITY_LEAVE = 'MATERNITY_PATERNITY_LEAVE',

    // Request for time off for jury duty or legal obligations
    JURY_DUTY = 'JURY_DUTY',

    // Request for time off for religious observances
    RELIGIOUS_OBSERVANCE = 'RELIGIOUS_OBSERVANCE',

    // Request for time off for family-related matters
    FAMILY_LEAVE = 'FAMILY_LEAVE',

    // Request for time off for educational purposes
    EDUCATIONAL_LEAVE = 'EDUCATIONAL_LEAVE',

    // Request for time off for relocation or moving
    RELOCATION = 'RELOCATION',

    // Request for time off for parental leave
    PARENTAL_LEAVE = 'PARENTAL_LEAVE',

    // Request for time off for bereavement or loss of a family member
    FAMILY_BEREAVEMENT = 'FAMILY_BEREAVEMENT',

    // Request for time off for personal emergencies
    PERSONAL_EMERGENCY = 'PERSONAL_EMERGENCY',

    // Request for business travel or work-related trips
    BUSINESS_TRAVEL = 'BUSINESS_TRAVEL',
    
    // Request for scheduled time off for vacation purposes
    VACATION = 'VACATION',
    
    // Request for time allocation for training or development activities
    TRAINING = 'TRAINING',
    
    // Any other type of schedule change request not covered by specific categories
    OTHER = 'OTHER'
}