// import {
//   defineConfig
// } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       '@mui/material/Unstable_Grid2': path.resolve(__dirname, 'node_modules/@mui/material/Unstable_Grid2'),
//     },
//   },
// });

import {
  defineConfig
} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: 'react',
    },
  },
});
