
export const TS_CONFIG_REACT = {
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

export const BABEL_CONFIG_REACT = {
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
    ]
};

export const SERVICE_BASE_PATH = "https://localhost:10000"
export const NAV_ICON_LIB = "naviconlib";
export const ICON_LIB = "iconlib";