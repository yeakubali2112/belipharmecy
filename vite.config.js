import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function medexDevPlugin() {
  return {
    name: 'medex-api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/medex-search')) {
          try {
            const url = new URL(req.url, 'http://localhost');
            const q = url.searchParams.get('q') || '';
            const { default: handler } = await server.ssrLoadModule('/api/medex-search.js');
            const mockReq = { query: { q }, method: req.method };
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
            console.error('MedEx dev server error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message, results: [], count: 0 }));
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
    medexDevPlugin(),
  ],
})
