import Router from "koa-router";
import publicWebdataRoutes from './publicwebdataRoutes.js';
import uploadRoutes  from './uploadRoutes.js';
import loginRoutes from "./loginRoutes.js";
import logoutRoutes from "./logoutRoutes.js";
// import userRouter from './userRoutes';

const unprotectedRouter = new Router();

// unprotectedRouter.use("/login", loginRouter);
// unprotectedRouter.use("/user", userRouter);
// unprotectedRouter.use("/", uploadRoutes);
unprotectedRouter.use("/login", loginRoutes);
unprotectedRouter.use("/logout", logoutRoutes);
// unprotectedRouter.use("/upload", uploadRoutes);
unprotectedRouter.use("/publicwebdata", publicWebdataRoutes);



export default unprotectedRouter;
