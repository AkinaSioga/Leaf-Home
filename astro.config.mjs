import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import icon from 'astro-icon';
import { fileURLToPath } from 'node:url';

const site = process.env.SITE_URL ?? 'https://akinasuki.love';
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  // 自定义顶级域名（apex domain）通过 CNAME 提供服务，站点挂在根路径下，
  // 因此 base 保持默认的 '/'，无需设置。
  site,
  base,
  integrations: [icon(), svelte()],
  vite: {
    resolve: {
      alias: {
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
        '@constants': fileURLToPath(new URL('./src/constants', import.meta.url)),
        '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
        '@i18n': fileURLToPath(new URL('./src/i18n', import.meta.url)),
        '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
        '@config': fileURLToPath(new URL('./src/config', import.meta.url)),
        '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
        '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
