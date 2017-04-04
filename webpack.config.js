var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var webpack = require('webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
module.exports = function (env) {
    const nodeEnv = env && env.prod ? 'production' : 'development';
    const isProd = nodeEnv === 'production';
    var plugins = [
        new HtmlWebpackPlugin({
            template: '!!html-loader?interpolate=require!./src/index.html',
            inject: 'html'
        }),
        new ExtractTextPlugin("styles.css"),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        })
    ]
    if (isProd) {
        plugins.push(
            new UglifyJSPlugin()
        );
        plugins.push(new CleanWebpackPlugin(['dist'], {
            root: path.join(__dirname, ""),
            verbose: true,
            dry: false
        }));
    } else {
        plugins.push(
            new webpack.NamedModulesPlugin(),
            new webpack.HotModuleReplacementPlugin()
        );
    };
    return {
        entry: ['./src/js/scripts.js'],
        output: {
            path: path.join(__dirname, "dist"),
            filename: 'js/bundle.js'
        },
        devServer: {
            contentBase: path.join(__dirname, "src"),
            port: 9000
        },
        devtool: isProd ? 'source-map' : 'eval',
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
                    use: "file-loader?name=./images/[name].[ext]"
                },
                {
                    test: /\.(js)$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015']
                    }
                }
            ]
        },
        plugins: plugins
    }
};