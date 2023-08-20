import { Context } from "koa";
import path from "path";
import fs from "fs";
import LowWithLodash from "../common/LowWithLodash.js";
import {JSONFile} from 'lowdb/node';
import { fileURLToPath } from "node:url";
import { SourceDb, IUser, IRole, IPermission } from "../db/sourceDb.js"
import ErrorCode from "../common/ErrorCode.js";
import { config } from "../config.js";
import _ from "lodash";

export default class AuthService {

    
        
}