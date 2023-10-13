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
    const { blockHash } = args as { blockHash: string };
    const blockEnergyService = new BlockEnergyService(blockHash);

    return await blockEnergyService.getData();
  }
});

export { BlockEnergyResolver };
