// 1 通过模块名字 fs 引入模块
const fs = require("fs");
// 写入文件操作 promise 实现
const WriteFiles = (path, content) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(
            path,
            content, {
                flag: "a",
                encoding: "utf-8",
            },
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(path);
                }
            }
        );
    });
};
// 读取文件操作 promise 实现
const ReadFiles = path => {
    return new Promise((resolve, reject) => {
        fs.readFile(
            path, {
                flag: "r",
                encoding: "utf-8",
            },
            function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            }
        );
    });
};

// console.log(object);
// let p0 = ReadFiles("./testfile.txt");
// p0.then(res => {
//     console.log(res);
// });
// 导出两个方法
module.exports = {
    WriteFiles,
    ReadFiles,
};