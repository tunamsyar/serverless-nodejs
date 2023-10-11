import { schemaComposer } from "graphql-compose";
import { BlockResponse, DailyBlockEnergyTC } from "../types/block";
import { blockchainApi } from "../api/blockchain";

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

    // store date and hash blocks
    let dateMap = new Map<Number, Array<string>>;

    // get list of hash blocks from api and map
    for (let day = 0; day < numOfDays; day++) {
      const currentDay = currentDate.subtract(day, "day");

      const { data } = await blockchainApi.get<Array<BlockResponse>>(
        `/blocks/${currentDay.valueOf()}?format=json`
      );

      const blockHashes = data.map((t: { hash: any; }) => { return t.hash });

      dateMap.set(currentDay.valueOf(), blockHashes);
    }

    const promises = Array.from(dateMap).map(async ([key, value]) => {
      let blockSize = 0;

      // Fetch block data concurrently
      const blockPromises = value.map(async (block) => {
        const { data } = await blockchainApi.get<BlockResponse>(`/rawblock/${block}`);
        return Number(data.size);
      });

      // Wait for all block data promises to resolve concurrently
      const blockSizes = await Promise.all(blockPromises);

      // Calculate the total block size
      blockSize = blockSizes.reduce((acc, size) => acc + size, 0);

      let energyConsumption = blockSize * ENERGY_COST;

      return { date: key.toString(), energy: energyConsumption };
    });

    try {
      const result = await Promise.all(promises);
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
