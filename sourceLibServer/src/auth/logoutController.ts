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

export default class LogoutController {

    public static logout = async (ctx: Context) => {
        console.info("--logoutController.logout");

        try {
            ctx.cookies.set('token', null, {
                expires: new Date(0), 
                path: '/', 
                httpOnly: true,
                overwrite: true
            });
            ctx.status = 200;
            ctx.body = {
                code: ErrorCode.SUCCESS,
                success: true,
                data: null,
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