import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job, JobOptions, Queue } from 'bull';

@Injectable()
export class QueueFactoryService {
  private readonly queues = new Map<string, Queue>();

  constructor(
    @InjectQueue('notifications') private notificationsQueue: Queue,
    @InjectQueue('schedule-generation') private scheduleQueue: Queue,
    @InjectQueue('payroll-processing') private payrollQueue: Queue,
    @InjectQueue('work-hour-calculation') private workHourQueue: Queue,
  ) {
    this.queues.set('notifications', notificationsQueue);
    this.queues.set('schedule-generation', scheduleQueue);
    this.queues.set('payroll-processing', payrollQueue);
    this.queues.set('work-hour-calculation', workHourQueue);
  }

  getQueue(name: string): Queue | undefined {
    return this.queues.get(name);
  }

  async addJob<T>(
    queueName: string, 
    jobName: string, 
    data: T, 
    options?: JobOptions
  ): Promise<Job<T> | null> {
    const queue = this.getQueue(queueName);
    if (!queue) {
      return null;
    }
    return queue.add(jobName, data, options);
  }
}