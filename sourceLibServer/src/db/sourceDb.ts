import path from "node:path";
import { fileURLToPath } from "node:url";
import LowWithLodash from "../common/LowWithLodash.js";
import {JSONFile} from 'lowdb/node';
import { config } from "../config.js";

// 用户
export interface IUser {
    id: string;
    account: string;
    passwd: string;
}

// 角色
export interface IRole {
    id: string;
    name: string;
}

// 用户-角色
export interface IUserRole {
    userId: string;
    roleId: string;
}

// 资源
export interface IResource {
    id: string;
    name: string;
}

// 权限
export interface IPermission {
    roleId: string;
    resourceId: string;
    action: string;
}

// 业务资源来源
interface ISource {
    [key:string]: {
        format: string;
        path: string;
    };
}

// Logo属性
interface ILogoProps {
    id: string;
    title: string;
    category: string;
    sources: ISource;
    thumbnail: string;
    tag: string[];
}

// Logo分类属性
interface ILogoCategoryProps {
    id: string;
    name: {
        en: string;
        zh: string;
    }
}

// 业务资源数据
export type SourceData = {
    users: IUser[];
    roles: IRole[];
    user_roles: IUserRole[];
    resources: IResource[];
    permissions: IPermission[];
    logoCategory: ILogoCategoryProps[];
    logos: ILogoProps[]
}

export class SourceDb {
    private static dbInstance: LowWithLodash<SourceData>;

    public static getSourceDb = async () => {
        if(!SourceDb.dbInstance) {
            const __dirname = path.dirname( fileURLToPath(import.meta.url) )
            // const dbFile = path.resolve(__dirname, '../../source/db/db.json');
            const dbFile = config.lowDbPath;
            const adapter = new JSONFile<SourceData>(dbFile);
            const defaultData: SourceData = {
                users: [], 
                roles: [], 
                user_roles: [], 
                resources: [], 
                permissions: [],
                logoCategory: [], 
                logos: []
            };
            const db = new LowWithLodash<SourceData>(adapter, defaultData);

            await db.read();
            SourceDb.dbInstance = db;
        }
        return SourceDb.dbInstance;
    }
}