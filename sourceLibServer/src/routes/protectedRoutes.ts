import Router from "koa-router";
import privateWebdataRoutes from './privatewebdataRoutes.js';
import uploadRoutes  from './uploadRoutes.js';
import loginRoutes from "./loginRoutes.js";
// import userRouter from './userRoutes';

const protectedRouter = new Router();

protectedRouter.use("/upload", uploadRoutes);
protectedRouter.use("/privatewebdata", privateWebdataRoutes);



export default protectedRouter;
