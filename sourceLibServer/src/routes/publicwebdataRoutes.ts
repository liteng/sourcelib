import Router from "koa-router";
import  WebdataController  from '../webdata/webdataController.js'

const publicWebdataRouter = new Router();

publicWebdataRouter.get("/getallliconcategories", WebdataController.getAllIconCategory);
publicWebdataRouter.get("/getalliconslist", WebdataController.getAllIconsList);
publicWebdataRouter.get("/geticonslistbykeyword/:keyword", WebdataController.getIconsListByKeyword);
publicWebdataRouter.get("/getallicons", WebdataController.getAllIcons);
publicWebdataRouter.get("/geticonsbykeyword/:keyword", WebdataController.getIconsByKeyword);

publicWebdataRouter.get("/getallnaviconslist", WebdataController.getAllNavIconsList);
publicWebdataRouter.get("/getnaviconslistbykeyword/:keyword", WebdataController.getNavIconsListByKeyword);


publicWebdataRouter.get("/getalllogocategories", WebdataController.getAllLogoCategory);
publicWebdataRouter.get("/getalllogos", WebdataController.getAllLogos);
publicWebdataRouter.get("/getlogosbycategory/:category", WebdataController.getLogosByCategory);


// test
// publicWebdataRouter.post("/updateiconcategoryandtag", WebdataController.updateIconCategoryAndTag);
// publicWebdataRouter.post("/addnewcategory", WebdataController.addNewCategory);

export default publicWebdataRouter.routes();