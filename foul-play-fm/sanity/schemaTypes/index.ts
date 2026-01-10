import { type SchemaTypeDefinition } from 'sanity'
import presenter from './presenter'
import show from './show'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [presenter, show],
}
