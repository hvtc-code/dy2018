// axios 处理gb2312 编码数据
// const axios = require("axios");
const iconv = require("iconv-lite");
// const fs = require("fs");

const decodeGB = function(response) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        response.data.on("data", chunk => {
            chunks.push(chunk);
        });
        response.data.on("end", () => {
            const buffer = Buffer.concat(chunks);
            const result = iconv.decode(buffer, "gb2312");
            resolve(result);
        });
        // reject("error");
    });
};

// async function getDatas(baseUrl) {
//     let config = {
//         headers: {
//             "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.92 Safari/537.36",
//         },
//         responseType: "stream",
//     };
//     const res = await axios(baseUrl, config);
//     // return new Promise((resolve, reject) => {

//     //     resolve(res);
//     // });
//     return res;
// }

// 导出两个方法
module.exports = {
    // getDatas,
    decodeGB,
};