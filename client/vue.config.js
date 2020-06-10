module.exports = {
    outputDir: '../server/dist/public',
    devServer: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                ws: true,
                changeOrigin: true
            }
        },
    },
    css: {
        loaderOptions: {
            sass: {
                prependData: `@import "@/assets/css/_index.scss";`
            }
        }
    }
}