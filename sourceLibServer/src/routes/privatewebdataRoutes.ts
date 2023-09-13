import Router from "koa-router";
import  WebdataController  from '../webdata/webdataController.js'

const privateWebdataRouter = new Router();

privateWebdataRouter.post('/updatelogo', WebdataController.updateLogo);
privateWebdataRouter.post("/updateiconcategoryandtag", WebdataController.updateIconCategoryAndTag);
privateWebdataRouter.post("/addnewcategory", WebdataController.addNewCategory);

export default privateWebdataRouter.routes();