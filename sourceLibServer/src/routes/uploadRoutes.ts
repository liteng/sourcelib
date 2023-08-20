import Router from "koa-router";
import  UploadController  from '../upload/uploadController.js'

const uploadRouter = new Router();

uploadRouter.post("/logo", UploadController.uploadLogo);
uploadRouter.get("/test", UploadController.test);

export default uploadRouter.routes();