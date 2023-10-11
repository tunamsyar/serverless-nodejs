import { schemaComposer } from 'graphql-compose'

// Transaction object response format from APIs
type TransactionResponse = {
  hash: string,
  size: number,
}

const TransactionTC = schemaComposer.createObjectTC({
  name: "Transaction",
  fields: {
    transactionHash: "String",
    size: "Int",
    energy: "Float"
  }
});

export { TransactionTC, TransactionResponse}
