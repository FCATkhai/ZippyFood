// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,
  axios: {
      baseURL: process.env.API_URL || 'http://localhost:5000/api',
  },

  modules: ['@pinia/nuxt']
})