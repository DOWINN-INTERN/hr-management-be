import { Day } from '@/common/enums/day.enum';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GroupsService } from '../groups/groups.service';
import { ShiftsService } from '../shifts/shifts.service';

@Injectable()
export class DefaultShiftsSeeder implements OnModuleInit {
  private readonly logger = new Logger(DefaultShiftsSeeder.name);

  constructor(
    private readonly shiftsService: ShiftsService,
    private readonly groupsService: GroupsService
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    this.logger.log('Seeding default shifts and groups...');
    
    // Check if default shift already exists
    const existingShifts = await this.shiftsService.getRepository().find();
    if (existingShifts.length === 0) {
      // Create default day shift
      const dayShift = await this.shiftsService.create({
        startTime: '09:00:00',
        endTime: '18:00:00',
        breakTime: 60, // 1 hour lunch break
        duration: 8,   // 8 hour shift
        days: [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY],
      });
      
      this.logger.log(`Created day shift: ${dayShift.id}`);
      
      // Create default group for day shift
      const dayGroup = await this.groupsService.create({
        name: 'Standard Shift Group',
        description: 'Default group working standard office hours',
        shift: dayShift,
      });
      
      this.logger.log(`Created day shift group: ${dayGroup.id}`);
  
      // Create night shift
      const nightShift = await this.shiftsService.create({
        startTime: '16:00:00',
        endTime: '00:00:00',
        breakTime: 45, // 45 minute dinner break
        duration: 7.25, // 7.25 hour shift (accounting for break)
        days: [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY],
      });
      
      this.logger.log(`Created night shift: ${nightShift.id}`);
      
      // Create night shift group
      const nightGroup = await this.groupsService.create({
        name: 'Night Shift Group',
        description: 'Group working evening to midnight hours',
        shift: nightShift,
      });
      
      this.logger.log(`Created night shift group: ${nightGroup.id}`);
  
      // Create graveyard shift
      const graveyardShift = await this.shiftsService.create({
        startTime: '00:00:00',
        endTime: '08:00:00',
        breakTime: 30, // 30 minute break
        duration: 7.5, // 7.5 hour shift (accounting for break)
        days: [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY],
      });
      
      this.logger.log(`Created graveyard shift: ${graveyardShift.id}`);
      
      // Create graveyard shift group
      const graveyardGroup = await this.groupsService.create({
        name: 'Graveyard Shift Group',
        description: 'Group working overnight hours',
        shift: graveyardShift,
      });
      
      this.logger.log(`Created graveyard shift group: ${graveyardGroup.id}`);
    } else {
      this.logger.log('Shifts already exist, skipping seeder');
    }
  }
}