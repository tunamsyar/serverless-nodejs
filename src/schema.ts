import { SchemaComposer } from 'graphql-compose'
import { BlockEnergyResolver } from './resolvers/block'

const schemaComposer = new SchemaComposer()

schemaComposer.Query.addFields({
  hello: {
    type: () => 'String!',
    resolve: () => 'Hi there, good luck with the assignment!',
  },
  block_energy: BlockEnergyResolver
})

export const schema = schemaComposer.buildSchema()
