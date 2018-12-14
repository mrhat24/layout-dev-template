var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var webpack = require('webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var multi = require("multi-loader");
var fs = require('fs');
var HtmlBeautifyPlugin = require('html-beautify-webpack-plugin');

require('dotenv').config({path: fs.existsSync('.env') ? '.env' : 'default.env'});

const extractSASS = new ExtractTextPlugin({ filename: '[name].css' });

function getHtmlPluginConfig(HTML_LOADER, page, jsFiles) {
    let config = {

    };
    if (jsFiles.indexOf(page.name) >= 0) {
        config = Object.assign({}, config, {chunks: ['vendor', 'app', 'dev', page.name]});
    } else {
        config = Object.assign({}, config, {chunks: ['vendor', 'app', 'dev']});
    }
    switch (HTML_LOADER) {
        case 'pug': {
            return Object.assign({},config, {
                filename: page.name + '.html',
                template: './src/pages/' + page.name + '.pug',
                inject: true
            });
        }
        default:
            return Object.assign({}, config,{
                filename: page.name,
                template: '!!html-loader?interpolate=require!./src/pages/'+page.name+'.html',
                inject: 'html',
            });
    }
}


function readDir(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, function (err, list) {
            if (err) {
                reject(err)
            } else {
                resolve(list);
            }
        });
    })
}

function filterFiles(list, type) {
    return list.filter(elem => path.extname(elem) == '.'+type).map(elem => {
        return {'name': path.basename(elem, path.extname(elem))};
    })
}

module.exports = async function (env) {
    let pages = await readDir("./src/pages");
    pages = filterFiles(pages, process.env.HTML_LOADER);

    let jsFiles = await readDir("./src/js");
    jsFiles = filterFiles(jsFiles, 'js');
    jsFiles = jsFiles.map(item => item.name);
    let chunks = (() => {
        let c = {};
        jsFiles.map(item => {
            c[item] = './src/js/' + item + '.js';
        });
        return c;
    })();

    const nodeEnv = env && env.prod ? 'production' : 'development';
    const isProd = nodeEnv;
    var plugins = [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        }),
        extractSASS,
        //new ExtractTextPlugin("styles.css"),
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
            plugins.push(new HtmlWebpackPlugin(getHtmlPluginConfig(process.env.HTML_LOADER, page, jsFiles)));
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
    plugins.push(new HtmlBeautifyPlugin({
        config: {
            html: {
                end_with_newline: true,
                indent_size: 2,
                indent_with_tabs: true,
                indent_inner_html: true,
                preserve_newlines: true,
                unformatted: ['p', 'i', 'b', 'span'],
            }
        }
    }));
    let entry = Object.assign(
        {},
        {
            vendor: [
                // "jquery",
                "@babel/polyfill"
            ]
        },
        chunks);
    return {
        entry: entry,
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
                    use: extractSASS.extract({
                        fallback: 'style-loader',
                        use: [
                            {loader: 'css-loader', options: {modules: true, importLoaders: 1, localIdentName: '[local]', minimize: isProd}},
                            {loader: 'postcss-loader', options: {
                                config: {
                                    ctx: {
                                        cssnext: {},
                                        autoprefixer: { browsers: 'last 100 versions', grid: true },
                                        cssnano: {}
                                    }
                                }
                            }},
                            {loader: 'sass-loader', options: {outputStyle: 'expanded'}}
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
                    test: /\.pug/,
                    use: 'pug-loader'
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
                    loader: 'babel-loader'
                }
            ]
        },
        plugins: plugins,
        optimization: {
            minimize: true,
            minimizer: [
                new UglifyJSPlugin({
                    test: /\/vendor.js$/i
                })
            ],
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