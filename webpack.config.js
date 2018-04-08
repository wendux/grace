var webpack = require('webpack');
var path = require('path');
module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.resolve("dist"),
        filename:"grace.js",
        libraryTarget: "umd"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ['es2015']
                        }
                    },
                ]
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            // compress: {
            //     warnings: true
            // },
            sourceMap: true
        })
    ]
}