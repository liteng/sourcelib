import Router from "koa-router";
import  LoginController  from '../auth/loginController.js';

const loginRouter = new Router();

loginRouter.post("/", LoginController.auth);

export default loginRouter.routes();