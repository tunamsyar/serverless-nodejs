import { schemaComposer } from "graphql-compose";
import { TransactionResponse, TransactionTC } from "./transaction";

// Block object response format from APIs
type BlockResponse = {
  hash: string,
  size: number,
  tx: [TransactionResponse]
}

const BlockTC = schemaComposer.createObjectTC({
  name: "Block",
  fields: {
    blockHash: "String",
    size: "Int",
    energy: "Float",
    transactions: {
      type: [TransactionTC]
    }
  }
});

const DailyBlockEnergyTC = schemaComposer.createObjectTC({
  name: "DailyBlockEnergy",
  fields: {
    date: "String",
    energy: "Float"
  }
});

export { BlockTC, BlockResponse, DailyBlockEnergyTC };
