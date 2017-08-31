var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var webpack = require('webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var pages = require('./src/pages');
module.exports = function (env) {
    const nodeEnv = env && env.prod ? 'production' : 'development';
    const isProd = nodeEnv === 'production';
    var plugins = [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        }),
        new ExtractTextPlugin("styles.css"),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: "vendor",

            // filename: "vendor.js"
            // (Give the chunk a different name)

            minChunks: Infinity,
            // (with more entries, this ensures that no other module
            //  goes into the vendor chunk)
        })
    ];

    for(let i = 0; i < pages.length; i++){
        if(pages[i]){
            let page = pages[i];
            plugins.push(new HtmlWebpackPlugin({
                filename: page.name,
                template: '!!html-loader?interpolate=require!./src/pages/'+page.name,
                inject: 'html'
            }));
        }
    }

    if (isProd) {
        // plugins.push(
        //     new UglifyJSPlugin()
        // );
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
        entry: {
            vendor: ['babel-polyfill','jquery','./src/js/scripts.js'],
            app: './src/js/app.js'
        },
        output: {
            path: path.join(__dirname, "dist"),
            filename: 'js/[name].js'
        },
        devServer: {
            contentBase: path.join(__dirname, "src"),
            port: 9000,
            host: "0.0.0.0",
            disableHostCheck: true
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
                    test: /\.css/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: 'css-loader'
                    })
                },
                {
                    test: /\.html/,
                    use: 'html-loader'
                },
                {
                    test: /\.(md)$/i,
                    use: "file-loader?name=./[name].[ext]"
                },
                {
                    test: /\.(ttf|otf|woff|woff2|eot)$/i,
                    use: "file-loader?name=./fonts/[name].[ext]"
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