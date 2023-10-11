import { SchemaComposer } from 'graphql-compose'
import { BlockEnergyResolver } from './resolvers/block'
import { DailyBlockEnergyConsumptionResolver } from './resolvers/daily_block'
import { WalletResolver } from './resolvers/wallet'

const schemaComposer = new SchemaComposer()

schemaComposer.Query.addFields({
  hello: {
    type: () => 'String!',
    resolve: () => 'Hi there, good luck with the assignment!',
  },
  block_energy: BlockEnergyResolver,
  daily_block_energy_consumption: DailyBlockEnergyConsumptionResolver,
  wallet_energy: WalletResolver
})

export const schema = schemaComposer.buildSchema()
