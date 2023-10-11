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

export { BlockTC, BlockResponse };
