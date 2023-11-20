import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Koa, { Next, Context } from "koa";
import https from "https";
import cors from "@koa/cors";
import session from "koa-session";
import koaStatic from "koa-static";
import koabody from "koa-body";
import jwt from "koa-jwt";
import jsonwebtoken from "jsonwebtoken";
import logger from "./logger.js";
import { config } from "./config.js";
import ErrorCode from "./common/ErrorCode.js";
import unprotectedRouter from "./routes/unprotectedRoutes.js"
import protectedRouter from "./routes/protectedRoutes.js"
import { NewLineKind } from "typescript";

const app = new Koa();
const __dirname = path.dirname( fileURLToPath(import.meta.url) )

try {
    app.use(cors());

    // 设置ssl证书配置
    const sslOptions = {
        key: fs.readFileSync(config.privateKeyPath),
        cert: fs.readFileSync(config.caCertPath)
    }

    // 配置静态目录
    app.use(koaStatic(config.sourcePath));
    // 配置session中间件
    app.keys = config.cookieSecretKeys;
    app.use(session({maxAge: config.sessionExpires}, app));

    app.use(koabody.koaBody({ multipart: true }));

    // const secret = "this is a secret key";
    
    // 获取所有不受保护的路由(只取第一级路径)并去重[...new Set(array)]
    /* const paths = [ ...new Set(unprotectedRouter.stack.map(route => {
        const splitedPaths = route.path.split('/');
        const path = `${splitedPaths[0]}/${splitedPaths[1]}`;
        // const reg = new RegExp('^' + path);
        // return reg;
        return path;
    }))]; */
    /* const urls = paths.map( path => {
        const reg = new RegExp('^' + path);
        return reg;
    }); */

    // console.log(urls);
    // console.log(urls[1].test('/webdata/getlogos'));

    // router.get('/login', async (ctx, next) => {
    //     // 处理登录逻辑
    //     // 如果登录成功，生成JWT令牌并存储在cookie中
    //     const token = jwt.sign({ /* user info */ }, secret);
    //     ctx.cookies.set('token', token);
    //     ctx.redirect(ctx.query.redirect || '/');
    // });

    // app.use(async (ctx, next) => {
    //     ctx.response.set('Access-Control-Allow-Credentials', 'true'),
    //     await next();
    // });


    app.use(async (ctx, next) => {
        return await next().catch(err => {
            console.error(err);
            if(401 == err.status) {
                ctx.status = 401;
                ctx.body = {
                    code: ErrorCode.LOGIN_FAILED,
                    success: false,
                    data: null,
                    error: "验证失败"
                }
            }else {
                throw err;
            }
        })
    })

    app.use(async (ctx, next)=>{
        console.log('请求头-Authorization: ', ctx.request.header.authorization);
        await next();
    });

    // 生成token
    const token = jsonwebtoken.sign({userId: 'xxxx', account: 'yyyyyyy'}, config.jwtSecretKey, {expiresIn: config.tokenExpires});
    // app.use(async (ctx, next)=>{
    //     ctx.cookies.set('tokenX', token, {
    //         maxAge: config.cookieExpires, 
    //         path: '/',
    //         httpOnly: false,
    //         overwrite: true,
    //         sameSite: 'none',
    //         secure: true
    //     });
    //     ctx.status = 200;
    //     ctx.body = {
    //         code: ErrorCode.SUCCESS,
    //         success: true,
    //         data: {tokenX: token},
    //         error: "验证失败"
    //     }
    // })

    // 注册无需验证的路由
    app.use(unprotectedRouter.routes()).use(unprotectedRouter.allowedMethods());

    // 注册jwt验证中间件
    app.use(jwt({
        secret: config.jwtSecretKey,
        debug: true
    }));

    // const onUnauthorized = async (ctx: Context, next: Next) => {
    //     ctx.status = 401;
    //     ctx.body = { error: 'JWT验证失败' };
    //     await next();
    // };

    // app.use(async (ctx, next) => {
    //     console.log('===========================');
    //     console.log(ctx.state.user);
    //     console.log('---------------------------');
    //     if(!ctx.state.user) {
    //         // JWT 验证未通过，执行自定义未授权处理逻辑
    //         await onUnauthorized(ctx, next);
    //     } else {
    //         await next();
    //     }
    // })

    // 注册需验证的路由
    app.use(protectedRouter.routes()).use(protectedRouter.allowedMethods());
    
    // 创建并启动服务
    https.createServer(sslOptions, app.callback()).listen(config.port, () => {
        logger.info(`Server running on port ${config.port}`);
    })

} catch(error) {
    logger.error(error);
    console.error(error);
}