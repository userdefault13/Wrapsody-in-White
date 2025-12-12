// GraphQL client composable for making GraphQL queries and mutations
export const useGraphQL = () => {
  const executeQuery = async (query: string, variables?: Record<string, any>) => {
    try {
      const response = await $fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: {
          query,
          variables: variables || {}
        }
      })

      if (response.errors) {
        const errorMessage = response.errors[0]?.message || 'GraphQL error'
        const errorObj = new Error(errorMessage) as any
        errorObj.data = response
        errorObj.errors = response.errors
        throw errorObj
      }

      return response.data
    } catch (error: any) {
      console.error('GraphQL query error:', error)
      if (error.data) {
        console.error('GraphQL response:', error.data)
      }
      throw error
    }
  }

  return {
    executeQuery
  }
}

