import { blockchainApi } from "../api/blockchain";
import { BlockResponse } from "../types/block";
import { CacheService } from "./cache_service";
class BlockEnergyService {
  result: any;
  cached: any;
  redisBlockKey: string;
  energyCost: number;
  blockHash: string;

  constructor(blockHash:string) {
    this.energyCost = 4.56;
    this.redisBlockKey = `block-${blockHash}`;
    this.blockHash = blockHash;
  }

  async getData() {
    let cachedData = await this.getDataFromCache();

    if (cachedData) {
      this.result = cachedData;
      return this.result;
    } else {

      await this.getDataFromApi();
    }
  }

  private async getDataFromApi(){
    const redisService = new CacheService(this.redisBlockKey)

    const { data } = await blockchainApi.get<BlockResponse>(
      `/rawblock/${this.blockHash}`
    );

    const transactions = data.tx.map((t) => {
      return {
        transactionHash: t.hash,
        size: t.size,
        energy: Number(t.size) * this.energyCost,
      }
    });

    this.result = {
      blockHash: data.hash,
      size: data.size,
      energy: Number(data.size) * this.energyCost,
      transactions
    };

    await redisService.set(this.result);

    return this.result;
  }

  private async getDataFromCache(){
    const redisService = new CacheService(this.redisBlockKey)

    let resultFromService = await redisService.get();

    return resultFromService;
  }
}

export { BlockEnergyService };
