import { IconCompiler, IIconToolsOptions } from "@icon-park/compiler";
import fs from 'fs';
import p from 'path';
import { IIconProps, preprocess } from "./preprocess";
import { mkdirp } from "mkdirp";

const BUILD_CONFIG: Omit<IIconToolsOptions, 'type'> = {
    author: 'USUE',
    useType: true,
    fixedSize: true,
    stroke: 4,
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
    cssPrefix: 'i',
    // colors: [
    //     {
    //         type: 'color',
    //         color: '#000'
    //     },
    //     {
    //         type: 'color',
    //         color: '#027BFA'
    //     },
    //     {
    //         type: 'color',
    //         color: '#FFF'
    //     },
    //     {
    //         type: 'color',
    //         color: '#57FF7E'
    //     }
    // ],
    colors: [
        {
            type: 'color',
            color: '#027BFA'
        },
        {
            type: 'color',
            color: '#57FF7E'
        },
        {
            type: 'color',
            color: '#FFF'
        },
        {
            type: 'color',
            color: '#333'
        }
    ],
    theme: [
        {
            name: 'outline',
            fill: [
                {
                    type: 'color',
                    color: '#000',
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
                    color: '#000',
                    name: 'fill',
                    currentColor: true
                },
                {
                    type: 'color',
                    color: '#027BFA',
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
                    color: '#027BFA',
                    name: 'fill',
                    currentColor: true
                },
                {
                    type: 'color',
                    color: '#57FF7E',
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
                    color: '#000',
                    name: 'outStrokeColor',
                    currentColor: true
                },
                {
                    type: 'color',
                    color: '#027BFA',
                    name: 'outFillColor'
                },
                {
                    type: 'color',
                    color: '#FFF',
                    name: 'innerStrokeColor'
                },
                {
                    type: 'color',
                    color: '#57FF7E',
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


export const compilerIcon = async (libType: string) => {
    console.debug('++compilerIcon begain');
    console.log('compiler lib type: ', libType);
    const iconsInfo: IIconProps[] = await preprocess(libType);
    // console.debug('iconsInfo: ', iconsInfo);

    console.debug('编译器处理图标开始');
    iconsInfo.forEach(icon => compiler.appendIcon({
        name: icon.name,
        description: icon.title,
        content: icon.svg,
        rtl: icon.rtl
    }));
    console.debug('编译器处理图标结束');

    const indexFileConteng = compiler.getIndexCode();
    const lines = indexFileConteng.split('\n');
    lines.splice(0, 5);
    const newIndexFileContent = lines.join('\n');
    // console.debug('index.ts: ', newIndexFileContent);
    console.debug('将index.ts写入: ', p.join(__dirname, `./icons/${libType}/react/src/index.ts`));
    // console.debug('将index.ts写入: ', p.join(__dirname, './Icons/iconlib/react/src/index.ts'));
    fs.writeFileSync(p.join(__dirname, `./icons/${libType}/react/src/index.ts`), newIndexFileContent, { encoding: 'utf8' });
    // fs.writeFileSync( p.join(__dirname, './Icons/iconlib/react/src/index.ts'), newIndexFileContent, {encoding: 'utf8'});
    console.debug('index.ts写入结束');

    console.debug('编译后图标组件写入: ', p.join(__dirname, `./icons/${libType}/react/src`));
    // console.debug('编译后图标组件写入: ', p.join(__dirname, './Icons/iconlib/react/src'));
    iconsInfo.forEach(icon => {
        const file = compiler.getIconFile(icon.name);
        const iconCmpName = p.basename(file.path, '.tsx');
        // console.log('iconCmpName: ', iconCmpName);
        const fp = p.join(__dirname, `./Icons/${libType}/react/src`, file.path);
        // const fp = p.join(__dirname, './Icons/iconlib/react/src', file.path);
        mkdirp.sync(p.dirname(fp));
        console.debug('写入图标组件: ', fp);
        fs.writeFileSync(fp, file.content, 'utf8');
        icon.CompnentElement = iconCmpName;
    })
    console.debug('编译后图标组件写入结束');

    console.debug('iconMap写入: ', p.join(__dirname, `./Icons/${libType}/react/iconsMap.json`));
    // console.debug('iconMap写入: ', p.join(__dirname, './Icons/iconlib/react/iconsMap.json'));
    fs.writeFileSync(p.join(__dirname, `./Icons/${libType}/react/iconsMap.json`), JSON.stringify(iconsInfo, null, 4), { encoding: 'utf8' });
    // fs.writeFileSync(p.join(__dirname, './Icons/iconlib/react/iconsMap.json'), JSON.stringify(iconsInfo, null, 4), {encoding: 'utf8'});
    console.debug('iconMap写入结束');
    console.debug('++compilerIcon end');
    return iconsInfo;
}
// 执行(for调试)
// compilerIcon();