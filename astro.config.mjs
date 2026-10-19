import { defineConfig } from 'astro/config';

const githubPages = process.env.GITHUB_PAGES === 'true';
const siteUrl = process.env.SITE_URL?.trim();

export default defineConfig({
  site: siteUrl || (githubPages ? 'https://keijitakeda.github.io' : undefined),
  // A custom domain serves this repository at /, not /sfc-tlab-web/.
  base: githubPages && !siteUrl ? '/sfc-tlab-web' : '/',
  output: 'static',
  build: { format: 'directory' },
});
