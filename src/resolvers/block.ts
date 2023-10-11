import { schemaComposer } from "graphql-compose";
import { BlockResponse, BlockTC } from "../types/block";
import { blockchainApi } from "../api/blockchain";

const ENERGY_COST = 4.56;

const BlockEnergyResolver = schemaComposer.createResolver({
  name: "Block Energy",
  type: BlockTC,
  args: {
    blockHash: "ID!"
  },
  resolve: async({args}) => {
    const { blockHash } = args;
    const { data } = await blockchainApi.get<BlockResponse>(
      `/rawblock/${blockHash}`
    )

    const transactions = data.tx.map((t) => {
      return {
        transactionHash: t.hash,
        size: t.size,
        energy: Number(t.size) * ENERGY_COST,
      }
    });

    const block = {
      blockHash: data.hash,
      size: data.size,
      energy: Number(data.size) * ENERGY_COST,
      transactions
    }

    return block;
  }
});

export { BlockEnergyResolver };
