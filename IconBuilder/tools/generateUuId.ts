import { v4 as uuidv4 } from 'uuid';

const args = process.argv.slice(2); // 去掉前两个元素

function main(args: any[]) {
    if (args.length < 1) {
        console.error('请输入需生成uuid的数量！')
        return;
    }

    if (isNaN(Number(args[0]))) {
        console.error('请输入数字！')
        return;
    }

    if (!Number.isInteger(Number(args[0]))) {
        console.error('请输入整数！')
        return;
    }

    
    const count = Number((args[0]));

    for( let i=0; i<count; i++) {
        const uuid = uuidv4();
        console.log(uuid);
    }
}

main(args);