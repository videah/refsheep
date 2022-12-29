import { defineConfig } from 'vite'
import Blurhash from 'vite-plugin-blurhash'

export default defineConfig({
    clearScreen: false,
    appType: 'custom',
    publicDir: false,
    build: {
        lib: {
            fileName: 'script',
            entry: 'src/index.ts',
            formats: ['es'],
        },
        outDir: './public',
        emptyOutDir: false,
        manifest: true,
        assetsDir: '',
    },
    server: {
        port: 8001,
    },
    plugins: [
        Blurhash.blurHash(
            {
                imageDir: '/content',
                mapPath: '/src/blurhash-map.json',
            }
        )
    ],
})