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
      // Create default shift
      const defaultShift = await this.shiftsService.create({
        startTime: '09:00:00',
        endTime: '17:00:00',
        breakTime: 60, // 1 hour lunch break
        duration: 8,   // 8 hour shift
        days: [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY],
      });
      
      this.logger.log(`Created default shift: ${defaultShift.id}`);
      
      // Create default group associated with the shift
      const defaultGroup = await this.groupsService.create({
        name: 'Standard Shift Group',
        description: 'Default group working standard office hours',
        shift: defaultShift,
      });
      
      this.logger.log(`Created default group: ${defaultGroup.id}`);
    } else {
      this.logger.log('Default shifts already exist, skipping seeder');
    }
  }
}