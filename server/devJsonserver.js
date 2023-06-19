const path = require('path');
const jsonServer = require("json-server");
const jsonServerConfig = require("./jsonserver.config");

const runJsonServer = () => {
    const server = jsonServer.create();
    const router = jsonServer.router(path.resolve(__dirname, jsonServerConfig.dbFile));
    const middlewares = jsonServer.defaults();
    server.use(middlewares)
    server.use(router)
    console.log("starting JSON Server...");
    server.listen(jsonServerConfig.port, () => {
      console.log('JSON server is running in http://localhost:', jsonServerConfig.port);
    })
}

module.exports = runJsonServer;