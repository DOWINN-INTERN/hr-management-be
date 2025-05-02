import { CutoffStatus } from '@/common/enums/cutoff-status.enum';
import { Day } from '@/common/enums/day.enum';
import { CutoffsService } from '@/modules/payroll-management/cutoffs/cutoffs.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ShiftDay } from '../entities/shift-day.entity';
import { GroupsService } from '../groups/groups.service';
import { ShiftsService } from '../shifts.service';

@Injectable()
export class DefaultShiftsSeeder implements OnModuleInit {
  private readonly logger = new Logger(DefaultShiftsSeeder.name);

  constructor(
    private readonly shiftsService: ShiftsService,
    private readonly groupsService: GroupsService,
    private readonly cutoffsService: CutoffsService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    // this.logger.log('Seeding default shifts and groups...');
    
    // Check if default shift already exists
    const existingShifts = await this.shiftsService.getRepository().count();
    if (existingShifts > 0) {
      // this.logger.log('Shifts already exist, skipping seeder');
      return;
    }
    
    // Find or create a default cutoff to associate with shifts
    let defaultCutoff = await this.cutoffsService.findOneBy({
      status: CutoffStatus.PENDING
    }) || await this.cutoffsService.getActiveCutoff();

    if (!defaultCutoff) {
      throw new Error('No active cutoff found. Please create a cutoff first.');
    }

    // Common reference for cutoff
    const cutoffRef = { id: defaultCutoff.id };
    const weekdays = [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY];
    
    // 1. Create standard day shift
    await this.createDayShift(weekdays, cutoffRef);
    
    // 2. Create night shift with overnight flag
    await this.createNightShift(weekdays, cutoffRef);
    
    // 3. Create graveyard shift
    await this.createGraveyardShift(weekdays, cutoffRef);
    
    // 4. Create weekend shift
    await this.createWeekendShift(cutoffRef);
    
    // 5. Create flexible shift
    await this.createFlexibleShift(cutoffRef);
    
    this.logger.log('Successfully seeded all default shifts and groups');
  }

  private async createDayShift(weekdays: Day[], cutoffRef: { id: string }) {
    // Create shift days array for cascade insertion
    const dayShifts: Partial<ShiftDay>[] = weekdays.map(day => ({
      day,
      startTime: '09:00:00',
      endTime: '18:00:00',
      breakTime: 60,
      duration: 8,
      isOvernight: false,
    }));
    
    // Create shift with days using cascade
    const dayShift = await this.shiftsService.create({
      name: 'Standard Day Shift',
      description: 'Regular 9-6 workday with 1 hour break',
      defaultStartTime: '09:00:00',
      defaultEndTime: '18:00:00',
      defaultBreakTime: 60,
      defaultDuration: 8,
      days: dayShifts,
      cutoffs: [cutoffRef]
    });
    
    this.logger.log(`Created day shift: ${dayShift.id}`);
    
    // Create default group for day shift
    const dayGroup = await this.groupsService.create({
      name: 'Standard Day Shift Group',
      description: 'Default group working standard office hours',
      shift: { id: dayShift.id },
    });
    
    this.logger.log(`Created day shift group: ${dayGroup.id}`);
    
    return dayShift;
  }

  private async createNightShift(weekdays: Day[], cutoffRef: { id: string }) {
    // Create shift days array for cascade insertion
    const nightShiftDays: Partial<ShiftDay>[] = weekdays.map(day => ({
      day,
      startTime: '16:00:00',
      endTime: '00:00:00',
      breakTime: 45,
      duration: 7.25,
      isOvernight: true, // This shift crosses midnight
    }));
    
    // Create shift with days using cascade
    const nightShift = await this.shiftsService.create({
      name: 'Night Shift',
      description: 'Evening to midnight shift',
      defaultStartTime: '16:00:00',
      defaultEndTime: '00:00:00',
      defaultBreakTime: 45,
      defaultDuration: 7.25,
      days: nightShiftDays,
      cutoffs: [cutoffRef]
    });
    
    this.logger.log(`Created night shift: ${nightShift.id}`);
    
    // Create night shift group
    const nightGroup = await this.groupsService.create({
      name: 'Night Shift Group',
      description: 'Group working evening to midnight hours',
      shift: { id: nightShift.id },
    });
    
    this.logger.log(`Created night shift group: ${nightGroup.id}`);
    
    return nightShift;
  }

  private async createGraveyardShift(weekdays: Day[], cutoffRef: { id: string }) {
    // Create shift days array for cascade insertion
    const graveyardShiftDays: Partial<ShiftDay>[] = weekdays.map(day => ({
      day,
      startTime: '00:00:00',
      endTime: '08:00:00',
      breakTime: 30,
      duration: 7.5,
      isOvernight: false,
    }));
    
    // Create shift with days using cascade
    const graveyardShift = await this.shiftsService.create({
      name: 'Graveyard Shift',
      description: 'Midnight to morning shift',
      defaultStartTime: '00:00:00',
      defaultEndTime: '08:00:00',
      defaultBreakTime: 30,
      defaultDuration: 7.5,
      days: graveyardShiftDays,
      cutoffs: [cutoffRef]
    });
    
    this.logger.log(`Created graveyard shift: ${graveyardShift.id}`);
    
    // Create graveyard shift group
    const graveyardGroup = await this.groupsService.create({
      name: 'Graveyard Shift Group',
      description: 'Group working overnight hours',
      shift: { id: graveyardShift.id },
    });
    
    this.logger.log(`Created graveyard shift group: ${graveyardGroup.id}`);
    
    return graveyardShift;
  }

  private async createWeekendShift(cutoffRef: { id: string }) {
    // Create shift days array for cascade insertion
    const weekendShiftDays: Partial<ShiftDay>[] = [Day.SATURDAY, Day.SUNDAY].map(day => ({
      day,
      startTime: '10:00:00',
      endTime: '16:00:00',
      breakTime: 30,
      duration: 5.5,
      isOvernight: false,
    }));
    
    // Create shift with days using cascade
    const weekendShift = await this.shiftsService.create({
      name: 'Weekend Shift',
      description: 'Weekend coverage with different hours',
      defaultStartTime: '10:00:00',
      defaultEndTime: '16:00:00',
      defaultBreakTime: 30,
      defaultDuration: 5.5,
      days: weekendShiftDays,
      cutoffs: [cutoffRef]
    });
    
    this.logger.log(`Created weekend shift: ${weekendShift.id}`);
    
    // Create weekend shift group
    const weekendGroup = await this.groupsService.create({
      name: 'Weekend Shift Group',
      description: 'Group working weekend hours',
      shift: { id: weekendShift.id },
    });
    
    this.logger.log(`Created weekend shift group: ${weekendGroup.id}`);
    
    return weekendShift;
  }

  private async createFlexibleShift(cutoffRef: { id: string }) {
    // Define different schedules for each day
    const flexSchedules = [
      { day: Day.MONDAY, start: '08:00:00', end: '16:00:00', break: 60, duration: 7 },
      { day: Day.TUESDAY, start: '09:00:00', end: '17:00:00', break: 45, duration: 7.25 },
      { day: Day.WEDNESDAY, start: '10:00:00', end: '18:00:00', break: 45, duration: 7.25 },
      { day: Day.THURSDAY, start: '09:00:00', end: '17:00:00', break: 45, duration: 7.25 },
      { day: Day.FRIDAY, start: '08:00:00', end: '14:00:00', break: 30, duration: 5.5 },
    ];
    
    // Create shift days array for cascade insertion
    const flexShiftDays: Partial<ShiftDay>[] = flexSchedules.map(schedule => ({
      day: schedule.day,
      startTime: schedule.start,
      endTime: schedule.end,
      breakTime: schedule.break,
      duration: schedule.duration,
      isOvernight: false,
    }));
    
    // Create shift with days using cascade
    const flexShift = await this.shiftsService.create({
      name: 'Flexible Shift',
      description: 'Different hours each day of the week',
      defaultStartTime: '09:00:00',
      defaultEndTime: '17:00:00',
      defaultBreakTime: 45,
      defaultDuration: 7.25,
      days: flexShiftDays,
      cutoffs: [cutoffRef]
    });
    
    this.logger.log(`Created flexible shift: ${flexShift.id}`);
    
    // Create flexible shift group
    const flexGroup = await this.groupsService.create({
      name: 'Flexible Shift Group',
      description: 'Group with different hours each day',
      shift: { id: flexShift.id },
    });
    
    this.logger.log(`Created flexible shift group: ${flexGroup.id}`);
    
    return flexShift;
  }
}