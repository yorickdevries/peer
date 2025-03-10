module.exports = {
    configureWebpack: {
        devtool: "source-map",
    },
    outputDir: "../server/dist/public",
    devServer: {
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                ws: true,
                changeOrigin: true,
            },
        },
    },
}
