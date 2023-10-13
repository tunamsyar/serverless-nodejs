import { redis_client } from "../redis/redis_client";

class CacheService {
  cached: any;
  cacheKey: string;
  result: any;

  constructor(cacheKey:string) {
    this.cacheKey = cacheKey;
  }

  async get() {
    try {
      await redis_client.connect();

      this.cached = await redis_client.get(this.cacheKey);

      this.result = JSON.parse(this.cached);

      await redis_client.disconnect();

      return this.result;

    } catch(err) {
      console.error(err);
      throw(err);
    }
  }

  async set(data:any) {
    try {
      await redis_client.connect()

      await redis_client.set(this.cacheKey, JSON.stringify(data));

      await redis_client.disconnect();

    } catch(err) {
      console.error(err);
      throw(err);
    }
  }
}

export { CacheService }
