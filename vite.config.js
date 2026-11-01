import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

const projectsDocument = {
  name: 'projects-document',
  enforce: 'post',
  generateBundle: {
    order: 'post',
    handler(options, bundle) {
      const home = bundle['index.html'];
      if (!home || home.type !== 'asset') return;
      const url = 'https://tushaarbportfolio.vercel.app/projects';
      const title = 'Projects | Tushaar Bharara — Web Development &amp; AI';
      const description = "Things I've Built: explore Tushaar Bharara's disaster-rescue rover, composite materials solver, mess management system and Aarthi AI financial planner.";
      const schema = { '@context': 'https://schema.org', '@type': 'CollectionPage', url, name: "Things I've Built.", author: { '@type': 'Person', name: 'Tushaar Bharara', url: 'https://tushaarbportfolio.vercel.app/' } };
      const html = String(home.source)
        .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
        .replace(/(<link rel="canonical" href=")[^"]+/, `$1${url}`)
        .replace(/(<meta property="og:url" content=")[^"]+/, `$1${url}`)
        .replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]+/g, `$1${title}`)
        .replace(/(<meta (?:name="description"|property="og:description"|name="twitter:description") content=")[^"]+/g, `$1${description}`)
        .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
      this.emitFile({ type: 'asset', fileName: 'projects/index.html', source: html });
    },
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), projectsDocument],
  server: {
    port: 5174,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    minify: 'esbuild',
    cssCodeSplit: true,
    modulePreload: { resolveDependencies: (filename, dependencies, context) => context.hostType === 'html' ? dependencies : [] },
    rollupOptions: { treeshake: true },
  },
});
