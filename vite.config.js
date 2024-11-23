import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'csv-loader',
      transform(code, id) {
        if (id.endsWith('.csv')) {
          const fileContent = fs.readFileSync(id, 'utf-8');
          const lines = fileContent.trim().split('\n');
          const headers = lines[0].split(',');
          const data = lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, index) => {
              obj[header.trim()] = values[index]?.trim() || '';
              return obj;
            }, {});
          });
          return {
            code: `export default ${JSON.stringify(data)}`,
            map: null
          };
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    exclude: ['csv-parse']
  }
});