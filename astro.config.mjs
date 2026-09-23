import { defineConfig } from 'astro/config';

const githubPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  site: githubPages ? 'https://keijitakeda.github.io' : undefined,
  base: githubPages ? '/sfc-tlab-web' : '/',
  output: 'static',
  build: { format: 'directory' },
});
