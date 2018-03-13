var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var webpack = require('webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var multi = require("multi-loader");
var fs = require('fs');

require('dotenv').config({path: fs.existsSync('.env') ? '.env' : 'default.env'});


function readDir (dir){
    return new Promise((resolve, reject) => {
        fs.readdir(dir, function(err, list) {
            if(err){
                reject(err)
            }else{
                resolve(list.map(elem => {return {'name': elem}; }));
            }
        });
    })
}

module.exports = async function (env) {
    let pages = await readDir("./src/pages");
    const nodeEnv = env && env.prod ? 'production' : 'development';
    const isProd = nodeEnv === 'production';
    var plugins = [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        }),
        new ExtractTextPlugin("styles.css"),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
            'process.env.pages': JSON.stringify(pages)
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            Popper: ['popper.js', 'default']
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
        plugins.push(new CleanWebpackPlugin([process.env.DIST_DIR ? process.env.DIST_DIR : "dist"], {
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
            vendor: [
                'babel-polyfill',
                'jquery',
                'bootstrap',
                './src/js/scripts.js'],
            app: './src/js/app.js'
        },
        output: {
            path: path.join(__dirname, process.env.DIST_DIR ? process.env.DIST_DIR : "dist"),
            filename: 'js/[name].js'
        },
        devServer: {
            contentBase: path.join(__dirname, "src"),
            port: 9000,
            host: "0.0.0.0",
            disableHostCheck: true
        },
        devtool: isProd ? false : 'eval',
        module: {
            rules: [
                {
                    test: /\.sass$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
                            {loader: 'css-loader', options: {modules: true, importLoaders: 1, localIdentName: '[local]', minimize: process.env.NODE_ENV == 'production'}},
                            {loader: 'postcss-loader', options: {
                                config: {
                                    ctx: {
                                        cssnext: {},
                                        autoprefixer: { browsers: 'last 100 versions', grid: true },
                                        cssnano: {}
                                    }
                                }
                            }},
                            {loader: 'sass-loader'}
                        ]
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
                    use: "file-loader?name=./img/[name].[ext]"
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
        plugins: plugins,
        optimization: {
            minimize: false,
            splitChunks: {
                cacheGroups: {
                    default: false,
                    commons: {
                        test: /node_modules/,
                        name: "vendor",
                        chunks: "all",
                    }
                }
            }
        }
    }
};