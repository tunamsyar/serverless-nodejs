import dayjs from "dayjs";
import { blockchainApi } from "../api/blockchain";
import { BlockResponse } from "../types/block";
import { CacheService } from "./cache_service";

class DailyBlockService {
  numOfDays: number;
  currentDate: any;
  energyCost: number;
  result: any;

  constructor(numOfDays:number) {
    this.energyCost = 4.56;
    this.numOfDays = numOfDays;
    this.currentDate = dayjs().startOf("day");
  }

  async getData() {
    type blockObject = { date: string, blockHashes: Array<string>};
    let dateMap: blockObject[] = []

    for (let day = 0; day < this.numOfDays; day++) {
      const currentDay = this.currentDate.subtract(day, "day");
      const currentDayTimestamp = currentDay.valueOf();
      const redisBlockKey = `datemap-${currentDayTimestamp}`;
      const redisService = new CacheService(redisBlockKey)

      try {
        let cachedData = await this.getDataFromCache(redisBlockKey);

        if (cachedData) {
          dateMap = JSON.parse(cachedData);
        } else {

          let apiData;
          apiData = await this.getDataFromApi(currentDay, currentDayTimestamp);

          dateMap.push(apiData);

          await redisService.set(JSON.stringify(dateMap));
        }
      } catch (err) {
        console.error(err, "FOR LOOP CATCH");
        throw err
      }
    }

    const promises = dateMap.map(async (data) => {
      let blockSize = 0;

      // Fetch block data concurrently
      const blockPromises = data.blockHashes.map(async (block) => {
        const redisService = new CacheService(`block-${block}`)

        let resultFromFetch;

        try {
          let cachedBlock = await redisService.get();

          if (cachedBlock) {
            resultFromFetch = JSON.parse(cachedBlock);
          } else {
            const { data } = await blockchainApi.get<BlockResponse>(`/rawblock/${block}`);

            resultFromFetch = data

            await redisService.set(JSON.stringify(resultFromFetch))
          }

          return Number(resultFromFetch.size);

        } catch (err) {
          console.error(err, "DATEMAP MAP CATCH");
          throw err
        }
      });

      // Wait for all block data promises to resolve concurrently
      const blockSizes = await Promise.all(blockPromises);

      // Calculate the total block size
      blockSize = blockSizes.reduce((acc, size) => acc + size, 0);

      let energyConsumption = blockSize * this.energyCost;

      return { date: data.date, energy: energyConsumption };
    });

    try {
      this.result = await Promise.all(promises);

      return this.result;
    } catch (error) {
      console.error('An error occurred:', error);
      return [{
        date: "12312312312",
        energy: 121231.123
      }];
    }
  }

  private async getDataFromApi(currentDay:any, currentDayTimestamp:any) {
    const { data } = await blockchainApi.get<Array<BlockResponse>>(
      `/blocks/${currentDayTimestamp}?format=json`
    );

    const blockHashes = data.map((t: { hash: any; }) => { return t.hash });

    return {
      date: currentDay.valueOf().toString(),
      blockHashes: blockHashes
    };
  }

  private async getDataFromCache(cacheKey:string) {
    const redisService = new CacheService(cacheKey);

    return await redisService.get();
  }
}

export { DailyBlockService };
