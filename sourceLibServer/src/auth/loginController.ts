import { Context } from "koa";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import LowWithLodash from "../common/LowWithLodash.js";
import {JSONFile} from 'lowdb/node';
import { fileURLToPath } from "node:url";
import { SourceDb, IUser, IRole, IPermission } from "../db/sourceDb.js"
import ErrorCode from "../common/ErrorCode.js";
import { config } from "../config.js";
import _ from "lodash";

export default class LoginController {

    public static auth = async (ctx: Context) => {
        console.info("--loginController.auth");

        try {
            const { account, passwd } = ctx.request.body;
            console.log(ctx.request.body);
            const db = await SourceDb.getSourceDb();
            const user: IUser = db.chain.get('users').find({account: account}).value();
            if(undefined == user || null == user) {
                ctx.status = 500;
                ctx.body = {
                    code: ErrorCode.LOGIN_FAILED,
                    success: false,
                    data: null,
                    error: '登录验证失败'
                }
                return;
            }
            console.debug("current user: ", user);
            // 该用户拥有的角色
            const roleIds: string[] = db.chain.get('user_roles').filter({userId: user.id}).map('roleId').value();
            const roles: IRole[] = db.chain.get('roles').filter(item => roleIds.includes(item.id)).value();
            // 该用户具有的访问权限
            const permissions: IPermission[] = db.chain.get('permissions').filter(item => roleIds.includes(item.roleId)).value();
            // 将账号、角色、权限信息写入session
            ctx?.session && (ctx.session.userData = {
                id: user.id,
                account: user.account,
                roles: roles,
                permissions: permissions
            });
            // 生成token
            const token = jwt.sign({userId: user.id, account: user.account}, config.jwtSecretKey, {expiresIn: config.tokenExpires});

            // 设置cookie
            ctx.cookies.set('token', token, {
                maxAge: config.cookieExpires, 
                path: '/',
                httpOnly: true,
                overwrite: true,
                sameSite: 'none',
                secure: true
            });
            ctx.status = 200;
            ctx.body = {
                code: ErrorCode.SUCCESS,
                success: true,
                data: {userId: user.id, account: user.account, token: token},
                error: null
            }
        } catch (err) {
            ctx.status = 500;
            ctx.body = {
                code: ErrorCode.SYS_ERROR,
                success: false,
                data: null,
                error: err
            }
        }
    }
        
}