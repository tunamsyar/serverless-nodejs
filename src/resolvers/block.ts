import { schemaComposer } from "graphql-compose";
import { BlockResponse, BlockTC } from "../types/block";
import { blockchainApi } from "../api/blockchain";
import { redis_client } from "../redis/redis_client";

const ENERGY_COST = 4.56;

const BlockEnergyResolver = schemaComposer.createResolver({
  name: "Block Energy",
  type: BlockTC,
  args: {
    blockHash: "ID!"
  },
  resolve: async({args}) => {
    const { blockHash } = args;
    const redisBlockKey = `block-${blockHash}`

    let result;

    try {
      await redis_client.connect();
      let cached = await redis_client.get(redisBlockKey);

      if (cached) {
        result = JSON.parse(cached);
      } else {
        const { data } = await blockchainApi.get<BlockResponse>(
          `/rawblock/${blockHash}`
        );

        const transactions = data.tx.map((t) => {
          return {
            transactionHash: t.hash,
            size: t.size,
            energy: Number(t.size) * ENERGY_COST,
          }
        });

        result = {
          blockHash: data.hash,
          size: data.size,
          energy: Number(data.size) * ENERGY_COST,
          transactions
        }

        await redis_client.set(redisBlockKey, JSON.stringify(result));
      }

      await redis_client.disconnect();

      return result;
    } catch (err) {
      console.error(err);
      throw err
    }
  }
});

export { BlockEnergyResolver };
