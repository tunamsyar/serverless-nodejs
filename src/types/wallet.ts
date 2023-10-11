import { schemaComposer } from "graphql-compose";
import { TransactionResponse } from "./transaction";

type WalletResponse = {
  address: string,
  txs: [TransactionResponse]
}

const WalletTC = schemaComposer.createObjectTC({
  name: "Wallet",
  fields: {
    address: "String",
    energy: "Float"
  }
});

export { WalletResponse, WalletTC }
