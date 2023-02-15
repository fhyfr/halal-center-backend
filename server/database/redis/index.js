const { createClient } = require('redis');

const { REDIS_URL } = process.env;
const logger = require('../../../src/helpers/logger');

const retryStrategy = (options) =>
  // retry forever, with a max retry delay of 10s
  Math.min(options.attempt * 100, 10000);

class CacheService {
  constructor() {
    this.client = createClient({
      url: REDIS_URL,
      db: 0,
      retry_strategy: retryStrategy,
      retry_unfulfilled_commands: true,
      legacyMode: true,
    });

    this.client.on('error', (error) => {
      logger.error(error);
    });

    (async () => {
      await this.client.connect();
    })();
  }

  set(key, value, expirationInSecond = 300) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, 'EX', expirationInSecond, (error, ok) => {
        if (error) {
          logger.error(error);
          return reject(error);
        }

        return resolve(ok);
      });
    });
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (error, reply) => {
        if (error) {
          logger.error(error);
          return reject(error);
        }

        if (reply === null) {
          return reject(new Error('cache not found'));
        }

        return resolve(reply.toString());
      });
    });
  }

  delete(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (error, count) => {
        if (error) {
          logger.error(error);
          return reject(error);
        }

        return resolve(count);
      });
    });
  }

  HSet(id, key, value, expirationInSecond = 300) {
    return new Promise((resolve, reject) => {
      this.client.hset(id, key, value, (error, ok) => {
        if (error) {
          logger.error(error);
          return reject(error);
        }
        this.client.expire(id, expirationInSecond);
        return resolve(ok);
      });
    });
  }

  HGet(id, key) {
    return new Promise((resolve, reject) => {
      this.client.hget(id, key, (error, reply) => {
        if (error) {
          logger.error(error);
          return reject(error);
        }

        if (reply === null) {
          return reject(new Error('cache not found'));
        }

        return resolve(reply.toString());
      });
    });
  }
}

module.exports = CacheService;
