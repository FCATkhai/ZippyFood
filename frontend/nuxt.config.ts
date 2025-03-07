// https://nuxt.com/docs/api/configuration/nuxt-config

import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: { enabled: true },
    ssr: false,
    css: ["~/assets/app.css"],
    modules: ['@pinia/nuxt'],
    nitro: {
        devProxy: {
            '/api': {
                target: 'http://localhost:5000/api',
                changeOrigin: true,
                prependPath: true,
            }
        }
    },
    vite: {
        plugins: [tailwindcss()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            },
        },
    }
})