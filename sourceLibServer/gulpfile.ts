import gulp from "gulp";
import babel from "gulp-babel";
import ts from 'gulp-typescript';
import merge from 'merge2';
import less from 'gulp-less';
import minifyCss from 'gulp-minify-css';
import rename from 'gulp-rename';
import configReact from "./source/asset/iconlib/react/tsconfig.json";

const TS_CONFIG_MAP = {
    react: configReact
};

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

function resolve(...arg: string[]): string {
    console.log('process.cwd: ', process.cwd());
    return p.resolve(process.cwd(), ...arg);
}

function createBuildTask(name: 'react'): string {
    const cwd = resolve('iconlib/', name);
    console.log('resolve-cwd: ', cwd);

    gulp.task('build-script-' + name, () => {
        const result = gulp
            .src(['src/*.ts', 'src/*.tsx', 'src/**/*.ts', 'src/**/*.tsx'], {
                cwd,
            })
            .pipe(ts(TS_CONFIG_MAP[name].compilerOptions));

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

    gulp.task('build-copy-icons-json-' + name, () => {
        return gulp
            .src(resolve('source/icons-config.json'))
            .pipe(rename('icons.json'))
            .pipe(gulp.dest(cwd));
    });

    const tasks = ['build-script-' + name, 'build-copy-icons-json-' + name];

    /* 
    gulp.task('build-css-' + name, () => {
        return gulp
            .src('src/runtime/index.less', { cwd })
            .pipe(less())
            .pipe(minifyCss())
            .pipe(gulp.dest(cwd + '/styles'));
    });

    gulp.task('build-less-' + name, () => {
        return gulp
            .src('src/runtime/index.less', { cwd })
            .pipe(gulp.dest(cwd + '/styles'));
    }); 

    tasks.push('build-css-' + name, 'build-less-' + name);
    */

    gulp.task('build-' + name, gulp.parallel(tasks));

    return 'build-' + name;
}

gulp.task(
    'default',
    gulp.parallel(
        createBuildTask('react')
    )
)