import path from 'path';
import fs from 'fs';
import gulp from 'gulp';
import del from 'del';
import babel from 'gulp-babel';
import ts from 'gulp-typescript';
import merge from 'merge2';
import { deleteFiles } from './utils/fsUtil';
import { TaskCallback } from 'undertaker';
// import less from 'gulp-less';
// import minifyCss from 'gulp-minify-css';


// Typscript 编译配置(for React)
const TS_CONFIG_REACT = {
    "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "strict": true,
        "rootDir": ".",
        "jsx": "react",
        "declaration": true,
        "declarationDir": "./",
        "moduleResolution": "node",
        "allowSyntheticDefaultImports": true,
        "esModuleInterop": true,
        "preserveSymlinks": true,
        "resolveJsonModule": true,
        "removeComments": true,
        "experimentalDecorators": true,
        "baseUrl": "./"
    },
    "exclude": []
};

// Babel 编译配置
const BABEL_CONFIG_MAP = {
    react: {
        presets: [
            [
                '@babel/preset-env',
                {
                    modules: false,
                    targets: {
                        browsers: ['> 1%', 'last 2 versions', 'not ie <= 8'],
                    },
                },
            ],
            '@babel/preset-react',
        ],
        plugins: [
            [
                '@babel/plugin-proposal-class-properties',
                {
                    loose: false,
                },
            ],
        ],
    }
};

// 基于项目根目录构建目标目录
function resolve(...arg: string[]): string {
    // console.log('process.cwd: ', process.cwd());
    return path.resolve(process.cwd(), ...arg);
}

// 构建任务
function createBuildTask(libType: string, name: 'react'): string {
    console.debug('++createBuildTask begain');
    const cwd = resolve(`./icons/${libType}/`, name);
    // const cwd = resolve('./Icons/iconlib/', name);
    console.log('resolve-cwd: ', cwd);

    // 创建gulp任务: 编译typescript脚本
    gulp.task('build-script-' + name, () => {
        console.debug('编译Typescript开始');
        const result = gulp
            .src(['src/*.ts', 'src/*.tsx', 'src/**/*.ts', 'src/**/*.tsx'], {
                cwd,
            })
            .pipe(ts(TS_CONFIG_REACT.compilerOptions));
        console.debug('编译Typescript结束');

        let jsResultStream = result.js;
        let dtsResultStream = result.dts;
        
        return merge([
            jsResultStream
                .pipe(babel(BABEL_CONFIG_MAP[name]))
                .pipe(gulp.dest(cwd + '/es'))
                .pipe(
                    babel({
                        plugins: ['@babel/plugin-transform-modules-commonjs'],
                    }),
                ),
            dtsResultStream
                .pipe(gulp.dest(cwd + '/es'))
        ]);
    });

    // 清理src目录中的过程文件
    // gulp.task('clear-src', async () => {
    //     del([
    //         resolve('Icons/iconlib/react/src/icons'), 
    //         resolve('Icons/iconlib/react/src/index.ts')
    //     ]);
    // });
    const tasks = ['build-script-' + name];
    gulp.task('build-' + name, gulp.series(tasks));
    console.debug('++createBuildTask end');
    return 'build-' + name;
}

// 整合任务
const gulpTasks = (libType: string, callback: TaskCallback) => { 
    gulp.series(createBuildTask(libType, 'react'))(callback);
}
// const gulpTasks = gulp.series(createBuildTask('react'));
// console.log(gulpTasks);
export default gulpTasks;
// 执行任务(for调试)
// gulpTasks(()=>{console.log('Icon compiler task is finished.')});




