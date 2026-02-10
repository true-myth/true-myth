import { transformerTwoslash } from '@shikijs/vitepress-twoslash';
import { defineConfig } from 'vitepress';
import deflist from 'markdown-it-deflist';
import footnote from 'markdown-it-footnote';
import path from 'node:path';

import typedocSidebar from '../api/typedoc-sidebar.json';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'True Myth',

  description: 'Safe, idiomatic null, error, and async code handling in TypeScript',

  // There's a bug that I'm just working around with this for now.
  ignoreDeadLinks: true,

  // This should help page size a bit?
  metaChunk: true,

  themeConfig: {
    outline: [2, 4],

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/introduction/' },
      { text: 'API', link: '/api/' },
      { text: 'Releases', link: 'https://github.com/true-myth/true-myth/releases' },
      { text: 'true-myth-zod', link: 'https://github.com/true-myth/true-myth-zod' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          collapsed: false,
          link: '/guide/introduction/',
          items: [
            { text: 'Getting started', link: '/guide/introduction/getting-started' },
            { text: 'Tour', link: '/guide/introduction/tour/' },
            {
              text: 'Tutorial',
              link: '/guide/introduction/tutorial/',
              collapsed: true,
              items: [
                { text: 'Dealing with Nothingness', link: '/guide/introduction/tutorial/maybe' },
                { text: 'Handling Errors', link: '/guide/introduction/tutorial/result' },
                { text: 'Going Async Safely', link: '/guide/introduction/tutorial/task' },
              ],
            },
          ],
        },
        {
          text: 'Understanding',
          link: '/guide/understanding/',
          collapsed: false,
          items: [
            { text: 'Maybe', link: '/guide/understanding/maybe' },
            { text: 'Result', link: '/guide/understanding/result' },
            {
              text: 'Task',
              collapsed: true,
              link: '/guide/understanding/task/',
              items: [
                {
                  text: 'Retries and delays',
                  link: '/guide/understanding/task/retries-and-delays',
                },
              ],
            },
            { text: 'Reference Types', link: '/guide/understanding/reference-types' },
            { text: 'Standard Schema Integration', link: '/guide/understanding/standard-schema' },
          ],
        },
        {
          text: 'Background',
          link: '/guide/background/',
          collapsed: true,
          items: [
            { text: 'Design philosophy', link: '/guide/background/design-philosophy' },
            { text: 'Naming choices', link: '/guide/background/naming' },
            { text: 'Comparison', link: '/guide/background/comparison' },
          ],
        },
      ],

      '/api/': [
        {
          text: 'API Reference',
          link: '/api/',
          items: typedocSidebar,
        },
      ],
    },

    search: {
      provider: 'local',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/true-myth/true-myth' }],
  },

  markdown: {
    codeTransformers: [
      transformerTwoslash({
        twoslashOptions: {
          compilerOptions: {
            target: 99, // ESNext
            module: 199, // NodeNext
            moduleResolution: 99, // NodeNext
            lib: ['lib.esnext.full.d.ts'],
            strict: true,
            noUnusedLocals: false,
            noUnusedParameters: false,
            esModuleInterop: true,
            paths: {
              'true-myth': [path.resolve(__dirname, '../../src/index.ts')],
              'true-myth/*': [path.resolve(__dirname, '../../src/*.ts')],
            },
          },
        },
      }),
    ],
    config: (md) => {
      md.use(deflist).use(footnote);
    },
  },

  vite: {
    resolve: {
      alias: {
        'true-myth': path.resolve(__dirname, '../../src'),
      },
    },
  },
});
