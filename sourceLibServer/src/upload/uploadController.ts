import { Context } from "koa";
import { Next } from "koa";
import ErrorCode from "../common/ErrorCode.js";
import path from "path";
import { fileURLToPath } from "node:url";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';
import { config } from "../config.js";


export default class UploadController {

    // public static async createUser(ctx: Context): Promise<void> {
    //     console.log(ctx.request);
    //     let md5: crypto.Hash = crypto.createHash('md5');
        
    //     const userRepository: Repository<User> = getManager().getRepository(User);

    //     const userToBeSaved: User = new User();
    //     userToBeSaved.id = ctx.request.body.id;
    //     userToBeSaved.account = ctx.request.body.account;
    //     userToBeSaved.password = md5.update(ctx.request.body.password).digest('hex');
    //     console.log(userToBeSaved);


    //     if (await userRepository.findOne({ account: userToBeSaved.account })) {
    //         ctx.status = 400;
    //         ctx.body = "The specified account already exists";
    //     } else {
    //         // save the user contained in the POST body
    //         const user = await userRepository.save(userToBeSaved);
    //         // return CREATED status code and updated user
    //         ctx.status = 201;
    //         ctx.body = user;
    //     }
    // }
    public static test(ctx: Context) {
        console.log("test");
        ctx.body = 'test ok';
    }

  public static async uploadLogo(ctx: Context, next: Next): Promise<void> {
    console.log("--uploadController.uploadLogo");

    const tmepPath = config.updateTempPath;
    console.log(tmepPath);
    
    try {
      // 获取上传的文件
      const file = ctx.request.files!.file;
      // console.log(file);
      // 重命名并保存文件
      if(!Array.isArray(file)){
        console.log("filepath: ", file.filepath);
        console.log("newFilename: ", file.newFilename);
        console.log("originalFilename: ", file.originalFilename);
        const reader = fs.createReadStream(file.filepath);
        const extName = file.originalFilename?.substring(file.originalFilename?.lastIndexOf('.'));
        const fileId = uuidv4();
        const tempFileName = `${fileId}${extName}`;
        const writer = fs.createWriteStream(`${tmepPath}/${tempFileName}`);
        reader.pipe(writer);
        ctx.status = 200;
        ctx.body = {
          code: ErrorCode.SUCCESS,
          success: true,
          data: {fileId: fileId, fileName: tempFileName},
          error: null
        }
        console.log(`File uploaded and saved as ${tempFileName}`);
        return;
      } else {

      }
      
      ctx.status = 500;
      ctx.body = ctx.body = {
        code: ErrorCode.UPLOAD_FASILED,
        success: false,
        data: null,
        error: "File upload failed"
      };
        
    } catch (err:any) {
      // 操作失败，回滚事务
      ctx.status = 500;
      ctx.body = ctx.body = {
        code: ErrorCode.UPLOAD_FASILED,
        success: false,
        data: null,
        error: 'Error: ' + err.message
      };
    }
  }
}