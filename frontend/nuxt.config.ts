// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  ssr: false, // Tắt SSR hoàn toàn để test middleware
  
  // Router config for active classes
  router: {
    linkActiveClass: 'active',
    linkExactActiveClass: 'active'
  },
  
  // Nuxt 4: Sử dụng app.head cho external CSS
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
        }
      ]
    }
  },

  css: ["~/assets/css/main.css"],
  
  vite: {
    optimizeDeps: {
      include: [
        'jwt-decode',
      ]
    }
  },
  // TẠMTẮT route rules để test middleware
  // routeRules: {
  //   '/admin/**': { ssr: false, prerender: false },
  //   '/login': { ssr: false }
  // },
  runtimeConfig: {
    public: {
      apiBase: "http://localhost:5000/api"
    }
  }
})