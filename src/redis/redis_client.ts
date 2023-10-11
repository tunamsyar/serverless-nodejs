import * as redis from "redis";

export const redis_client = redis.createClient( {
  socket: {
    host: 'localhost',
    port: 6379
  }
});
