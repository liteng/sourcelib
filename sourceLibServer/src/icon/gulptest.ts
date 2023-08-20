import path from "path";
import gulp from "gulp";
import babel from "gulp-babel";
import ts from 'gulp-typescript';
import merge from 'merge2';
import rename from 'gulp-rename';
import configReact from "../../source/asset/iconlib/react/tsconfig.json";

console.log(typeof configReact);
// console.log(path.resolve(process.cwd(), './source/asset/iconlib/'));

// gulp.task('default', () => {console.log('EXE');
//     gulp
//         .src(path.resolve(process.cwd(), './src/icon/iconsMap.json'))
//         .pipe(rename('icons.json'))
//         .pipe(gulp.dest(path.resolve(process.cwd(), './source/asset/iconlib/')));
// });

// const defaultTask = gulp.parallel('default');
// defaultTask(()=>{});