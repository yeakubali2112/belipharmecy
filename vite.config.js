import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function apiDevPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          try {
            const url = new URL(req.url, 'http://localhost');
            const routeName = url.pathname.replace(/^\/api\//, '').split('/')[0];
            const filePath = `/api/${routeName}.js`;

            // Read request body for POST/PUT
            let body = null;
            if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
              const buffers = [];
              for await (const chunk of req) {
                buffers.push(chunk);
              }
              const rawBody = Buffer.concat(buffers).toString();
              try {
                body = JSON.parse(rawBody);
              } catch {
                body = rawBody;
              }
            }

            const query = Object.fromEntries(url.searchParams.entries());
            const { default: handler } = await server.ssrLoadModule(filePath);

            const mockReq = {
              url: req.url,
              method: req.method,
              query,
              body,
              headers: req.headers
            };

            const mockRes = {
              setHeader: (k, v) => res.setHeader(k, v),
              status: (code) => {
                res.statusCode = code;
                return {
                  json: (data) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                  },
                  end: () => res.end()
                };
              }
            };

            await handler(mockReq, mockRes);
            return;
          } catch (err) {
            console.error('[API Dev Server Error]:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    apiDevPlugin(),
  ],
  build: {
    chunkSizeWarningLimit: 10000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('bangladeshMedicines50k')) {
            return 'medicines-db-50k';
          }
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('react')) return 'vendor';
          }
        }
      }
    }
  }
})
