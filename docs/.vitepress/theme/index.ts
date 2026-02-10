import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import '@shikijs/vitepress-twoslash/style.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    if (typeof window !== 'undefined') {
      import('@shikijs/vitepress-twoslash/client').then((m) => {
        app.use(m.default);
      });
    }
  },
} satisfies Theme;
