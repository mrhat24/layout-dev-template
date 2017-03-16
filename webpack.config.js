var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var webpack = require('webpack');
module.exports = function (env) {
    return {
        entry: ['./src/js/scripts.js'],
        output: {
            path: path.join(__dirname, "dist"),
            filename: 'js/bundle.js'
        },
        devServer: {
            contentBase: path.join(__dirname, "dist"),
            port: 9000,
            hot: true
        },
        devtool: 'eval',
        module: {
            rules: [
                {
                    test: /\.sass$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: 'css-loader?modules&importLoaders=1&localIdentName=[local]!autoprefixer-loader!sass-loader'
                    })
                },
                {
                    test: /\.html/,
                    use: 'html-loader'
                },
                {
                    test: /\.(jpe?g|png|gif|svg)$/i,
                    use: "file- loader?name=./images/[name].[ext]"
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: '!!html-loader?interpolate=require!./src/index.html',
                inject: 'html'
            }),
            new ExtractTextPlugin("css/styles.css")
        ]
    }
};