import { schemaComposer } from "graphql-compose";
import { BlockResponse, DailyBlockEnergyTC } from "../types/block";
import { blockchainApi } from "../api/blockchain";
import { redis_client } from "../redis/redis_client";

import dayjs from "dayjs";

const ENERGY_COST = 4.56;

const DailyBlockEnergyConsumptionResolver = schemaComposer.createResolver({
  name: "Daily Block Energy",
  args: {
    numOfDays: "Int!"
  },
  type: [DailyBlockEnergyTC],
  resolve: async({args}) => {
    const { numOfDays } = args as { numOfDays: number };;
    const currentDate = dayjs().startOf("day");

    await redis_client.connect();

    // store date and hash blocks
    type blockObject = { date: string, blockHashes: Array<string>};
    let dateMap: blockObject[] = []

    // get list of hash blocks from api and map
    for (let day = 0; day < numOfDays; day++) {
      const currentDay = currentDate.subtract(day, "day");
      const currentDayTimestamp = currentDay.valueOf();
      const redisBlockKey = `datemap-${currentDayTimestamp}`;

      try {
        let cached = await redis_client.get(redisBlockKey)

        if (cached) {
          dateMap = JSON.parse(cached);
        } else {

          const { data } = await blockchainApi.get<Array<BlockResponse>>(
            `/blocks/${currentDayTimestamp}?format=json`
          );

          const blockHashes = data.map((t: { hash: any; }) => { return t.hash });

          dateMap.push({ date: currentDay.valueOf().toString(), blockHashes: blockHashes });
          await redis_client.set(redisBlockKey, JSON.stringify(dateMap));
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
        let result;

        try {
          let cachedBlock = await redis_client.get(`block-${block}`);

          if (cachedBlock) {
            result = JSON.parse(cachedBlock);
          } else {
            const { data } = await blockchainApi.get<BlockResponse>(`/rawblock/${block}`);
            result = data
            await redis_client.set(`block-${block}`, JSON.stringify(result))
          }

          return Number(result.size);
        } catch (err) {
          console.error(err, "DATEMAP MAP CATCH");
          throw err
        }
      });

      // Wait for all block data promises to resolve concurrently
      const blockSizes = await Promise.all(blockPromises);

      // Calculate the total block size
      blockSize = blockSizes.reduce((acc, size) => acc + size, 0);

      let energyConsumption = blockSize * ENERGY_COST;

      return { date: data.date, energy: energyConsumption };
    });

    try {
      const result = await Promise.all(promises);

      await redis_client.disconnect();

      return result;
    } catch (error) {
      console.error('An error occurred:', error);
      return [{
        date: "12312312312",
        energy: 121231.123
      }];
    }
  }
});

export { DailyBlockEnergyConsumptionResolver };
