import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        headers: {
          'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://esm.sh",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https://images.unsplash.com https://cdn.download.ams.birds.cornell.edu https://www.monaconatureencyclopedia.com https://upload.wikimedia.org https://www.woodlandtrust.org.uk https://wildambience.com",
            "connect-src 'self' http://localhost:* https:",
            "media-src 'self' blob:",
          ].join('; '),
        }
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      envPrefix: 'VITE_',
    };
  });
