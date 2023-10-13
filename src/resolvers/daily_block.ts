import { schemaComposer } from "graphql-compose";
import { DailyBlockEnergyTC } from "../types/block";
import { DailyBlockService } from "../services/daily_block_service";

const ENERGY_COST = 4.56;

const DailyBlockEnergyConsumptionResolver = schemaComposer.createResolver({
  name: "Daily Block Energy",
  args: {
    numOfDays: "Int!"
  },
  type: [DailyBlockEnergyTC],
  resolve: async({args}) => {
    const { numOfDays } = args as { numOfDays: number };;
    const dailyBlockService = new DailyBlockService(numOfDays);

    let result;

    result = await dailyBlockService.getData();

    return result;
  }
});

export { DailyBlockEnergyConsumptionResolver };
