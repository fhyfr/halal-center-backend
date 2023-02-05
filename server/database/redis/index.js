const redis = require('redis');

const { REDIS_PORT, REDIS_HOST } = process.env;
const logger = require('../../../src/helpers/logger');

const retryStrategy = (options) =>
  // retry forever, with a max retry delay of 10s
  Math.min(options.attempt * 100, 10000);

class CacheService {
  constructor() {
    this.clientV1 = redis.createClient({
      port: REDIS_PORT || '6379',
      host: REDIS_HOST || '127.0.0.1',
      db: 0,
    });

    this.clientV2 = redis.createClient({
      port: REDIS_PORT || '6379',
      host: REDIS_HOST || '127.0.0.1',
      db: 2,
      retry_strategy: retryStrategy,
      retry_unfulfilled_commands: true,
    });

    this.clientV1.on('error', (error) => {
      logger.error(error);
    });
    this.clientV2.on('error', (error) => {
      logger.error(error);
    });
  }

  set(key, value, expirationInSecond = 300, dbV1 = false) {
    const redisClient = dbV1 ? this.clientV1 : this.clientV2;
    return new Promise((resolve, reject) => {
      redisClient.set(key, value, 'EX', expirationInSecond, (error, ok) => {
        if (error) {
          logger.error(error);
          return reject(error);
        }

        return resolve(ok);
      });
    });
  }

  get(key, dbV1 = false) {
    const redisClient = dbV1 ? this.clientV1 : this.clientV2;
    return new Promise((resolve, reject) => {
      redisClient.get(key, (error, reply) => {
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

  delete(key, dbV1 = false) {
    const redisClient = dbV1 ? this.clientV1 : this.clientV2;
    return new Promise((resolve, reject) => {
      redisClient.del(key, (error, count) => {
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
      this.clientV2.hset(id, key, value, (error, ok) => {
        if (error) {
          logger.error(error);
          return reject(error);
        }
        this.clientV2.expire(id, expirationInSecond);
        return resolve(ok);
      });
    });
  }

  HGet(id, key) {
    return new Promise((resolve, reject) => {
      this.clientV2.hget(id, key, (error, reply) => {
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
