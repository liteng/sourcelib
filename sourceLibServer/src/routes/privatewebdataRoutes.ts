import Router from "koa-router";
import  WebdataController  from '../webdata/webdataController.js'

const privateWebdataRouter = new Router();

privateWebdataRouter.post('/updatelogo', WebdataController.updateLogo);

export default privateWebdataRouter.routes();