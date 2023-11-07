const path = require('path');
const webpack = require('webpack');
const MiniCssExtracPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '../dist'),
        // publicPath: path.resolve(__dirname, '../public'),
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    chunks: "initial",
                    minChunks: 2,
                    minSize: 0,
                    name: 'commons'
                }
            }
        }
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, '../public/downloads/iconlib.zip'),
                    to: path.resolve(__dirname, '../dist/downloads')
                },
                {
                    from: path.resolve(__dirname, '../public/downloads/naviconlib.zip'),
                    to: path.resolve(__dirname, '../dist/downloads')
                }
            ]
        }),
        new MiniCssExtracPlugin({
            filename: '[name].[contenthash].css',
            chunkFilename: '[id].[contenthash].css'
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../index.html')
        }),
        new CleanWebpackPlugin(),
        // new webpack.DefinePlugin({
        //     "process.env.PUBLIC_URL": JSON.stringify(path.resolve(__dirname, '../public')),
        // }),
    ],
    module: {
        rules: [
            {
                test: /\.js/,
                use: ['babel-loader?cacheDirectory=ture'],
                include: path.join(__dirname, '../src')
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtracPlugin.loader,
                        options: {
                            publicPath: '../'
                        }
                    },
                    'css-loader'
                ]
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'less-loader'
                    }
                ]
            },
            {
                test: /\.(jpg|png|jpeg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 100,
                            fallback: {
                                loader: 'file-loader',
                                options: {
                                    name: 'img/[name].[hash:8].[ext]'
                                }
                            }
                        }
                    }
                ]
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 1024,
                            fallback: {
                                loader: 'file-loader',
                                options: {
                                    name: 'img/[name].[hash:8].[ext]'
                                }
                            }
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        alias: {
            '@': path.join(__dirname, '../src')
        }
    },
    devServer: {
        hot: true,
        open: true,
        port: 3500,
        static: {
            // directory: path.join(__dirname, '../dist'),
            directory: path.join(__dirname, '../public'),
            publicPath: '/public',
        }
    }
}