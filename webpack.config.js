const path = require('path');
const fs = require("fs");

// werbpack plugin
const webpack = require("webpack");
const { PowerBICustomVisualsWebpackPlugin } = require('powerbi-visuals-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');
const { VueLoaderPlugin } = require("vue-loader");
const { VuetifyPlugin } = require('webpack-plugin-vuetify')


// api configuration
const powerbiApi = require("powerbi-visuals-api");

// visual configuration json path
const pbivizPath = "./pbiviz.json";
const pbivizFile = require(path.join(__dirname, pbivizPath));

// the visual capabilities content
const capabilitiesPath = "./capabilities.json";
const capabilitiesFile = require(path.join(__dirname, capabilitiesPath));

const pluginLocation = './.tmp/precompile/visualPlugin.ts'; // path to visual plugin file, the file generates by the plugin

// string resources
const resourcesFolder = path.join(".", "stringResources");
const localizationFolders = fs.existsSync(resourcesFolder) && fs.readdirSync(resourcesFolder);
const statsLocation = "../../webpack.statistics.html";

// babel options to support IE11
let babelOptions = {
    presets: [
        [
            require.resolve('@babel/preset-env'),
            {
                // "targets": {
                //     "ie": "11"
                // },
                useBuiltIns: "entry",
                corejs: 3,
                modules: false
            }
        ],
        // "@babel/preset-react" // required for jsx files
    ],
    plugins: [
        [
            require.resolve('babel-plugin-module-resolver'),
            {
                root: ['./'],
            },
        ],
        // "@babel/preset-react" // required for jsx files
    ],
    sourceType: "unambiguous", // tell to babel that the project can contains different module types, not only es2015 modules
    cacheDirectory: path.join(".tmp", "babelCache") // path for cache files
};

const isProduction = true
module.exports = {
    entry: {
        "visual.js": pluginLocation,
    },
    target: "web",
    optimization: {
        minimize: isProduction, // enable minimization for create *.pbiviz file less than 2 Mb, can be disabled for dev mode
    },
    performance: {
        maxEntrypointSize: 1024000,
        maxAssetSize: 1024000
    },
    devtool: 'source-map',
    mode: isProduction ? "production" : "development",
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: [
                    {
                        loader: require.resolve('vue-loader'),
                        options: {
                            compilerOptions: {
                                isCustomElement: (tag) => tag === 'helloworld'
                            }
                        }
                    }
                ]
            },
            {
                parser: {
                    amd: false
                }
            },
            {
                test: /(\.ts)x|\.ts$/,
                use: [
                    {
                        loader: require.resolve('babel-loader'),
                        options: {
                            presets: [
                                // '@babel/react',
                                '@babel/env'
                            ]
                        },
                    },
                    {
                        loader: require.resolve('ts-loader'),
                        options: {
                            transpileOnly: false,
                            experimentalWatchApi: false,
                            appendTsSuffixTo: [/\.vue$/]
                        }
                    }
                ],
                exclude: [/node_modules/],
                include: /powerbi-visuals-|src|precompile\\visualPlugin.ts/,
            },
            {
                test: /(\.js)x|\.js$/,
                use: [
                    {
                        loader: require.resolve('babel-loader'),
                        options: babelOptions
                    }
                ],
                exclude: [/node_modules/]
            },
            {
                test: /\.json$/,
                // loader: require.resolve('json-loader'),
                loader: 'json-loader',
                type: "javascript/auto"
            },
            {
                test: /(\.scss)|(\.css)$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'sass-loader',
                    }
                ]
            },
            {
                test: /\.(woff|ttf|ico|woff2|jpg|jpeg|png|webp|svg)$/i,
                use: [
                    {
                        loader: 'base64-inline-loader'
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js', '.vue', '.json', '.css'],
        alias: {
            // 'vue$': 'vue/dist/vue.esm.js',
            'vue$': 'vue/dist/vue.esm-bundler.js',
            // 'vuetify': 'vuetify/lib',
            '@': path.resolve(__dirname, 'src'),
        }
    },
    output: {
        clean: true,
        path: path.join(__dirname, ".tmp", "drop"),
        publicPath: 'assets',
        filename: "[name]",
        library: pbivizFile.visual.guid,
        libraryTarget: "var",
    },
    devServer: {
        static: false,
        compress: true,
        port: 8080, // dev server port
        hot: false,
        liveReload: false,
        https: {
        },
        headers: {
            "access-control-allow-origin": "*",
            "cache-control": "public, max-age=0"
        },
        hot: false,
        allowedHosts: "all",
        static: path.join(__dirname, ".tmp", "drop"),
    },
    externals: {
        "powerbi-visuals-api": 'null',
    },
    plugins: [
        new VueLoaderPlugin(),
        new VuetifyPlugin({ autoImport: true }),
        new MiniCssExtractPlugin({
            filename: "visual.css",
            chunkFilename: "[id].css"
        }),
        new BundleAnalyzerPlugin({
            reportFilename: statsLocation,
            openAnalyzer: false,
            analyzerMode: `static`
        }),
        // visual plugin regenerates with the visual source, but it does not require relaunching dev server
        new webpack.WatchIgnorePlugin({
            paths: [
                path.join(__dirname, pluginLocation),
                "./.tmp/**/*.*"
            ]
        }),
        // custom visuals plugin instance with options
        new PowerBICustomVisualsWebpackPlugin({
            ...pbivizFile,
            compression: 9,
            capabilities: capabilitiesFile,
            stringResources: localizationFolders && localizationFolders.map(localization => path.join(
                resourcesFolder,
                localization,
                "resources.resjson"
            )),
            apiVersion: powerbiApi.version,
            capabilitiesSchema: powerbiApi.schemas.capabilities,
            pbivizSchema: powerbiApi.schemas.pbiviz,
            stringResourcesSchema: powerbiApi.schemas.stringResources,
            dependenciesSchema: powerbiApi.schemas.dependencies,
            devMode: false,
            generatePbiviz: true,
            generateResources: isProduction,
            modules: true,
            visualSourceLocation: "../../src/visual",
            pluginLocation: pluginLocation,
            packageOutPath: path.join(__dirname, "dist")
        }),
        new ExtraWatchWebpackPlugin({
            files: [
                pbivizPath,
                capabilitiesPath
            ]
        }),
        new webpack.ProvidePlugin({
            define: 'fakeDefine',
        })
    ]
};
