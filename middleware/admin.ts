export default defineNuxtRouteMiddleware((to, from) => {
  const { checkAuth } = useAuth()
  
  if (!checkAuth()) {
    return navigateTo('/admin/login')
  }
})

