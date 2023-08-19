const Webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const WebpackConfig = require("../builder/webpack.config");

const compiler = Webpack(WebpackConfig);
const devServerOptions = {...WebpackConfig.devServer};

const server = new WebpackDevServer(devServerOptions, compiler);
const runWebServer = async () => {
    console.log("starting WEB Server...");
    await server.start();
    console.log('WEB Server is runing in http://localhost:', devServerOptions.port);
};

module.exports = runWebServer;