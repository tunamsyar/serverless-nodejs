import { schemaComposer } from "graphql-compose";
import { WalletResponse, WalletTC } from "../types/wallet"
import { redis_client } from "../redis/redis_client";
import { blockchainApi } from "../api/blockchain";

const ENERGY_COST = 4.56;

const WalletResolver = schemaComposer.createResolver({
  name: "Wallet",
  type: WalletTC,
  args: {
    address: "ID!"
  },
  resolve: async({args}) => {
    const { address } = args;
    const redisAddressKey = `address-${address}`;

    let result;

    try {
      await redis_client.connect();
      let cached = await redis_client.get(redisAddressKey);

      if(cached) {
        result = JSON.parse(cached)
      } else {
        const { data } = await blockchainApi.get<WalletResponse>(
          `/rawaddr/${address}`
        );

        // sum trx sizes
        const trxSizes = data.txs.reduce((acc, trx) => {
          return acc + trx["size"]
        }, 0);

        result = {
          address: address,
          energy: trxSizes * ENERGY_COST
        }

        await redis_client.set(redisAddressKey, JSON.stringify(result));
      }
      await redis_client.disconnect();
      return result;
    } catch (err) {
      console.error(err);
      throw(err);
    }
  }
});

export { WalletResolver }
