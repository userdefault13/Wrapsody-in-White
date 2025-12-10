// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  // CSS imported in app.vue to ensure Tailwind utilities are included globally
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  app: {
    head: {
      title: 'Last Wrap Hero - Your Gift Wrapping Rescue Spot',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 
          name: 'description', 
          content: 'Your cozy neighborhood gift-wrapping rescue spot! Drop off, pick up later, or we\'ll deliver back to you. Take back time to enjoy the holiday season.' 
        }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  runtimeConfig: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    public: {
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    }
  },
  devServer: {
    host: process.env.NUXT_HOST || 'localhost', // Use localhost by default, can override with NUXT_HOST env var
    port: parseInt(process.env.NUXT_PORT || '3000')
  },
  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost'
      }
    },
    css: {
      devSourcemap: true
    }
  }
})
