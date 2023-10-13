import { blockchainApi } from "../api/blockchain";
import { WalletResponse } from "../types/wallet";

import { CacheService } from "./cache_service";

class WalletService {
  energyCost:number;
  walletAddress:string;
  cacheKey:string;
  result: any;

  constructor(walletAddress:string) {
    this.energyCost = 4.56;
    this.walletAddress = walletAddress;
    this.cacheKey = `address-${walletAddress}`;
  }

  async getData() {
    let cachedData = await this.getDataFromCache();

    if (cachedData) {
      this.result = cachedData;
    } else {
      this.result = await this.getDataFromApi();
    }

    return this.result;
  }

  private async getDataFromCache() {
    const redisService = new CacheService(this.cacheKey);

    return await redisService.get();
  }

  private async getDataFromApi() {
    const redisService = new CacheService(this.cacheKey);

    try {
      const { data } = await blockchainApi.get<WalletResponse>(
        `/rawaddr/${this.walletAddress}`
      );

      // sum trx sizes
      const trxSizes = data.txs.reduce((acc, trx) => {
        return acc + trx["size"]
      }, 0);

      this.result = {
        address: this.walletAddress,
        energy: trxSizes * this.energyCost
      };

      await redisService.set(this.result);

      return this.result

    } catch(err) {
      console.log(err);
      throw(err);
    }
  }
}

export { WalletService };
