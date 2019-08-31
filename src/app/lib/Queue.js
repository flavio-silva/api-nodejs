import Bee from 'bee-queue';
import CancellationMail from '../jobs/CancellationMail';
import redisConfig from '../../config/redis';

const jobs = [CancellationMail];

class Queue {
  constructor() {
    this.queues = {};
    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        queue: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  addJob(key, data) {
    return this.queues[key].queue.createJob(data).save();
  }

  processQueue() {
    Object.entries(this.queues).forEach(([, object]) => {
      object.queue.on('failed', this.handleFailedJobs).process(object.handle);
    });
  }

  handleFailedJobs(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
