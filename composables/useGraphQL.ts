// GraphQL client composable for making GraphQL queries and mutations
export const useGraphQL = () => {
  const executeQuery = async (query: string, variables?: Record<string, any>) => {
    try {
      const response = await $fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          query,
          variables: variables || {}
        }
      })

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'GraphQL error')
      }

      return response.data
    } catch (error: any) {
      console.error('GraphQL query error:', error)
      throw error
    }
  }

  return {
    executeQuery
  }
}

