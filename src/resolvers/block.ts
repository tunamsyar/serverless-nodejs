import { schemaComposer } from "graphql-compose";
import { BlockTC } from "../types/block";
import { BlockEnergyService } from "../services/block_energy_service";

const BlockEnergyResolver = schemaComposer.createResolver({
  name: "Block Energy",
  type: BlockTC,
  args: {
    blockHash: "ID!"
  },
  resolve: async({args}) => {
    const { blockHash } = args;
    const blockEnergyService = new BlockEnergyService(blockHash);

    let result;

    result = await blockEnergyService.getData();

    return result;
  }
});

export { BlockEnergyResolver };
