import { QueueOptions } from 'bull';

export interface QueueConfig {
  name: string;
  options?: QueueOptions;
}

export const queues: QueueConfig[] = [
  {
    name: 'notifications',
    options: {
      limiter: {
        max: 100,
        duration: 5000,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    },
  },
  {
    name: 'schedule-generation',
    options: {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
      },
    },
  },
  {
    name: 'work-hour-calculation',
    options: {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
      },
    },
  },
  // Add other queues as needed
];