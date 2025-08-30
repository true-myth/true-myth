import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import '@shikijs/vitepress-twoslash/style.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    // Only load on client-side to avoid SSR issues
    if (typeof window !== 'undefined') {
      import('@shikijs/vitepress-twoslash/client').then((m) => {
        app.use(m.default)
      })
    }
  }
} satisfies Theme
