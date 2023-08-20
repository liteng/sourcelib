import process from 'process';
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({path: ".env"});

export interface Config {
    isDevMode: boolean;
    port: number;
    // jwtSecret: string;
    // tokenExpInterval: number;
    // dbEntitiesPath: string[];
    sourcePath: string;
    updateTempPath: string;
    logoStorePath: string;
    lowDbPath: string;
    privateKeyPath: string;
    caCertPath: string;
    jwtSecretKey: string;
    tokenExpires: string;
    cookieSecretKeys: string[];
    cookieExpires: number;
    sessionSecretKey: string;
    sessionExpires: number;
    loginUrl: string;
}

const isDevMode = process.env.NODE_ENV === "development";
console.log("isDevMode: ", process.env.NODE_ENV);
const __dirname = path.dirname( fileURLToPath(import.meta.url) );
const _base = process.cwd();
console.log("__dirname: ", __dirname);
console.log("process.cwd(): ",process.cwd());

const config: Config = {
    isDevMode: isDevMode,
    port: +(process.env.PORT || 10000),
    // jwtSecret: process.env.JWT_SECRET || "",
    // tokenExpInterval: 24,
    // dbEntitiesPath: [
    //     ... isDevMode ? ["src/entity/**/*.ts"] : ["dist/entity/**/*.js"]
    // ]
    sourcePath: path.resolve(_base, './source'),
    updateTempPath: path.resolve(_base, './source/asset/temp'),
    logoStorePath: path.resolve(_base, './source/asset/logos'),
    lowDbPath: path.resolve(_base, './source/db/db.json'),
    privateKeyPath: path.resolve(_base, './ssl/private_key.pem'),
    caCertPath: path.resolve(_base, './ssl/ca-cert.pem'),
    jwtSecretKey: 'this-is-a-jwt-secret-key',
    tokenExpires: '1h',
    cookieSecretKeys: ['this-is-a-cookie-secret-key'],
    cookieExpires: 7 * 24 * 60 * 60 * 1000, // 7天
    sessionSecretKey: 'this-is-session-secret-key',
    sessionExpires: 1 * 60 * 60 * 1000, // 1h
    loginUrl: '/login'
    
};

export {config};