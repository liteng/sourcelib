import { IconCompiler, IIconToolsOptions } from "@icon-park/compiler";
import fs from 'fs';
import p from 'path';
import { fileURLToPath } from "url";
import { mkdirp } from "mkdirp";
import gulp from "gulp";
import babel from "gulp-babel";
import ts from 'gulp-typescript';
import merge from 'merge2';
import less from 'gulp-less';
import minifyCss from 'gulp-minify-css';
import rename from 'gulp-rename';
import configReact from "../../source/asset/iconlib/react/tsconfig.json";

console.log(configReact);

interface IIconProps {
    id: number;
    title: string;
    name: string;
    svg: string;
    tag: string[];
    category: string;
    categoryCN: string;
    author: string;
    rtl: boolean;
}

const __dirname = p.dirname( fileURLToPath(import.meta.url) );

console.log('__dirname: ', __dirname);
const iconTempDir = p.join(__dirname, '../../source/asset/iconTemp');
const data: IIconProps[] = [];
let count = 0;
fs.readdirSync(iconTempDir).forEach(file => {
    const filePath = p.join(iconTempDir, file);
    // console.log('filePath: ', filePath);
    const key = p.basename(filePath, '.svg').toLowerCase();
    // console.log('key: ', key);

    const svg = fs.readFileSync(filePath, 'utf-8');
    count = count + 1;
    data.push({
        id: count,
        title: '标题' + count,
        name: '名称' + count,
        category: 'Base',
        categoryCN: '基础',
        author: '作者',
        tag: ['标签' + count],
        rtl: false,
        svg: svg
    })
});

fs.writeFileSync(p.resolve(__dirname, './iconsMap.json'), JSON.stringify(data, null, 4), 'utf-8');




const BUILD_CONFIG: Omit<IIconToolsOptions, 'type'> = {
    author: 'IconPark',
    useType: true,
    fixedSize: true,
    stroke: 4,
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
    cssPrefix: 'i',
    colors: [
        {
            type: 'color',
            color: '#000'
        },
        {
            type: 'color',
            color: '#2F88FF'
        },
        {
            type: 'color',
            color: '#FFF'
        },
        {
            type: 'color',
            color: '#43CCF8'
        }
    ],
    theme: [
        {
            name: 'outline',
            fill: [
                {
                    type: 'color',
                    color: '#333',
                    name: 'fill',
                    currentColor: true
                },
                {
                    type: 'color',
                    color: 'transparent',
                    fixed: true,
                    name: 'background'
                }
            ],
            order: [0, 1, 0, 1]
        },
        {
            name: 'filled',
            fill: [
                {
                    type: 'color',
                    color: '#333',
                    name: 'fill',
                    currentColor: true
                },
                {
                    type: 'color',
                    color: '#FFF',
                    fixed: true,
                    name: 'background'
                }
            ],
            order: [0, 0, 1, 1]
        },
        {
            name: 'two-tone',
            fill: [
                {
                    type: 'color',
                    color: '#333',
                    name: 'fill',
                    currentColor: true
                },
                {
                    type: 'color',
                    color: '#2F88FF',
                    name: 'twoTone'
                }
            ],
            order: [0, 1, 0, 1]
        },
        {
            name: 'multi-color',
            fill: [
                {
                    type: 'color',
                    color: '#333',
                    name: 'outStrokeColor',
                    currentColor: true
                },
                {
                    type: 'color',
                    color: '#2F88FF',
                    name: 'outFillColor'
                },
                {
                    type: 'color',
                    color: '#FFF',
                    name: 'innerStrokeColor'
                },
                {
                    type: 'color',
                    color: '#43CCF8',
                    name: 'innerFillColor'
                }
            ],
            order: [0, 1, 2, 3]
        }
    ]
};

const compiler = IconCompiler.instance({
    ...BUILD_CONFIG,
    type: "react"
});

/* const icon = {
    "id": 0,
    "title": "布局",
    "name": "layout",
    "category": "Base",
    "categoryCN": "基础",
    "author": "未知",
    "tag": [
        "布局"
    ],
    "rtl": true,
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\">\n  <g fill=\"none\" fill-rule=\"evenodd\">\n    <path d=\"M0 0h16v16H0z\"/>\n    <path fill=\"black\" d=\"M2.375 14C2.168 14 2 13.832 2 13.625V2.375C2 2.168 2.168 2 2.375 2h11.25c.207 0 .375.168.375.375v11.25c0 .207-.168.375-.375.375H2.375ZM1.7 1c-.38675 0-.7.31325-.7.7v12.53315c0 .4235.34335.76685.76685.76685h12.4663c.4235 0 .76685-.34335.76685-.76685V1.77175C15 1.34545 14.65455 1 14.22825 1H1.7Z\"/>\n    <path fill=\"black\" d=\"M5 14h1V2H5zM6 6h8V5H6z\"/>\n  </g>\n</svg>"
}; */

data.forEach(icon => compiler.appendIcon({
    name: icon.name,
    description: icon.title,
    content: icon.svg,
    rtl: icon.rtl
}))


const files = compiler.getIconFiles();

files.forEach(({path, content}) => {
    const fp = p.join(__dirname, '../../source/asset/iconlib', 'react', 'src', path);
    console.debug('----fp: ', fp);
    //console.debug('----content: ', content);
    mkdirp.sync(p.dirname(fp));
    fs.writeFileSync(fp, content, 'utf8');
})

//gulp处理
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