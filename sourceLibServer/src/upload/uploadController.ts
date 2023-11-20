import { Context } from "koa";
import { Next } from "koa";
import ErrorCode from "../common/ErrorCode.js";
import path from "path";
import { fileURLToPath } from "node:url";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';
import { config } from "../config.js";


export default class UploadController {

    public static test(ctx: Context) {
        // console.log("test");
        ctx.body = 'test ok';
    }

  public static async uploadLogo(ctx: Context, next: Next): Promise<void> {
    console.log("--uploadController.uploadLogo");

    const tmepPath = config.updateTempPath;
    // console.log(tmepPath);
    
    try {
      console.log(ctx.request.files);
      // 获取上传的文件
      const file = ctx.request.files!.file;
      // console.log(file);
      // 重命名并保存文件
      if(!Array.isArray(file)){
        // 单个文件
        console.log("filepath: ", file.filepath);
        console.log("newFilename: ", file.newFilename);
        console.log("originalFilename: ", file.originalFilename);
        const reader = fs.createReadStream(file.filepath);
        const extName = file.originalFilename?.substring(file.originalFilename?.lastIndexOf('.'));
        const fileId = uuidv4();
        const tempFileName = `${fileId}${extName}`;
        const writer = fs.createWriteStream(`${tmepPath}/${tempFileName}`);

        await new Promise((resolve, reject) => {
          reader.pipe(writer);
          reader.on('error', (err) => {
            console.log(`File uploaded failed: ${err.message}`);
            reject(err);
          });
          writer.on('error', (err) => {
            console.log(`File uploaded failed: ${err.message}`);
            reject(err);
          });
          writer.on('finish', () => {
            console.log(`File uploaded and saved as ${tempFileName}`);
            resolve(null);
          });
        }).then( () => {
          console.log("resolve!");
          ctx.status = 200;
          ctx.body = {
            code: ErrorCode.SUCCESS,
            success: true,
            data: { fileId: fileId, fileName: tempFileName },
            error: null
          }
        }).catch((err) => {
          console.error(err);
          ctx.status = 500;
          ctx.body = {
            code: ErrorCode.UPLOAD_FASILED,
            success: false,
            data: null,
            error: "File upload failed - " + err.message
          };
        });

        await next();
      } else {
        // 多个文件

      }
      
      // ctx.status = 500;
      // ctx.body = ctx.body = {
      //   code: ErrorCode.UPLOAD_FASILED,
      //   success: false,
      //   data: null,
      //   error: "File upload failed"
      // };
        
    } catch (err:any) {
      // 操作失败，回滚事务
      console.error(err);
      ctx.status = 500;
      ctx.body = {
        code: ErrorCode.UPLOAD_FASILED,
        success: false,
        data: null,
        error: 'Error: ' + err.message
      };
    }
  }
}