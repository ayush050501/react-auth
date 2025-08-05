import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import clean from 'vite-plugin-clean';
import path from 'path';
import fixReactVirtualized from 'esbuild-plugin-react-virtualized';
// import analyze from 'rollup-plugin-analyzer';
import compression from 'vite-plugin-compression2';
import dotenv from 'dotenv';
// import eslint from 'vite-plugin-eslint';

import tailwindcss from "@tailwindcss/vite";

dotenv.config();

export default defineConfig({
    plugins: [
        clean({
            targetFiles: ['build.zip', 'build']
        }),
        react(),
        tailwindcss(),
        // eslint(),
        // analyze(),
        {
            name: 'load+transform-js-files-as-jsx',
            async transform(code, id) {
                if (!id.match(/src\/.*\.js$/)) {
                    return null;
                }

                return transformWithEsbuild(code, id, {
                    loader: 'jsx',
                    jsx: 'automatic',
                });
            },
        },
        compression({
            algorithm: 'gzip',
            exclude: [/\.(br)$ /, /\.(gz)$/],
        }),
    ],
    define: {
        'process.env': process.env,
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
            },
            plugins: [fixReactVirtualized],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        extensions: ['.js', '.jsx'],
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.jsx'), // Entry point - where your main exports are
            name: 'AuthPackage', // Global variable name when used in browser via <script> tag
            formats: ['es', 'umd'], // Output formats: ES modules + UMD (Universal Module Definition)
            fileName: (format) => `auth-package.${format}.js` // Output filenames for each format
        },
        outDir: 'dist',
        rollupOptions: {
            // Don't bundle React - expect it from consuming app
            external: ['react', 'react-dom'],
            
            // Global variables for UMD build (browser usage)
            output: {
                globals: {
                react: 'React',
                'react-dom': 'ReactDOM'
                }
            },
        }
    },
    server: {
        port: parseInt(process.env.PORT) || 5173,
        watch: {
            usePolling: true,
        },
        proxy: {

            // add reverse proxys here

            // '/notifications': {
            //     target: 'http://localhost:4547',
            //     changeOrigin: true,
            //     ws: true,
            // },
        },
    },
});