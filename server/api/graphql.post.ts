import { ApolloServer } from '@apollo/server'
import { startServerAndCreateH3Handler } from '@as-integrations/h3'
import { typeDefs } from '~/server/graphql/schema'
import { resolvers } from '~/server/graphql/resolvers'

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true // Enable GraphQL introspection for development
})

export default startServerAndCreateH3Handler(apolloServer, {
  context: async (event) => {
    // Add any context (auth, etc.) here if needed
    return { event }
  }
})

