import Router from "koa-router";
import  LogoutController  from '../auth/logoutController.js';

const logoutRouter = new Router();

logoutRouter.post("/", LogoutController.logout);

export default logoutRouter.routes();