import Router from "koa-router";
import  WebdataController  from '../webdata/webdataController.js'

const publicWebdataRouter = new Router();

publicWebdataRouter.get("/getallicons", WebdataController.getAllIcons);
publicWebdataRouter.get("/geticonsbykeyword/:keyword", WebdataController.getIconsByKeyword);

publicWebdataRouter.get("/getalllogocategories", WebdataController.getAllLogoCategory);
publicWebdataRouter.get("/getalllogos", WebdataController.getAllLogos);
publicWebdataRouter.get("/getlogosbycategory/:category", WebdataController.getLogosByCategory);

export default publicWebdataRouter.routes();