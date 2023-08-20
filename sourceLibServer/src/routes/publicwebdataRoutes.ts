import Router from "koa-router";
import  WebdataController  from '../webdata/webdataController.js'

const publicWebdataRouter = new Router();

publicWebdataRouter.get("/getalllogocategories", WebdataController.getAllLogoCategory);
publicWebdataRouter.get("/getalllogos", WebdataController.getAllLogos);
publicWebdataRouter.get("/getlogosbycategory/:category", WebdataController.getLogosByCategory);

export default publicWebdataRouter.routes();