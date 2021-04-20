const axios = require("axios");
const fs = require("fs");
const {
    WriteFiles,
    CreatDir
} = require("./fspromise.js");
const {
    decodeGB
} = require("./decode.js");
const async = require('async');
const BASEURL = "https://www.dy2018.com/";

// 封装函数，发送请求，获取响应文件，并转码
const req = function(url) {
    // console.log('getDatas-start');
    return new Promise(async(resolve, reject) => {
        let config = {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.92 Safari/537.36",
            },
            responseType: "stream",
        };
        let res = await axios(url, config);
        // 转码 GB2312 => UTF-8
        let contents = await decodeGB(res);
        res = null;
        resolve(contents);
    });
};
// 分析分类页面，获取电影详细连接以及标题
const parsrTypes = function(typeUrl) {
    return new Promise(async(resolve, reject) => {
        // 获取分类页面数据
        let contents = await req(typeUrl);
        if (contents) {
            // 提取电影的详细链接地址
            let moiveReg = /<a href="(.*?)" class="ulink" title="(?:.*?)">/gi;
            let moiveLinks = contents.matchAll(moiveReg);
            let moiveUrl = [];
            for (const link of moiveLinks) {
                let tempUrl = new URL(link[1], BASEURL);
                tempUrl = tempUrl.toString();
                // let tempobj = {
                //     moiveUrl: tempUrl.toString(),
                // };
                // moiveUrl.push(tempobj);
                moiveUrl.push(tempUrl);
                tempUrl = null;
                // tempobj = null;
            }
            resolve(moiveUrl);
        } else {
            reject("404 no such page");
        }
    });
};
// 封装一个正则匹配函数
function parse(reg, str) {
    let result = [];
    // let temp = str.match(reg);
    let temp = str.matchAll(reg);
    for (const item of temp) {
        // result.push(...item.slice(1));
        result.push(item[1]);
    }
    // result.push(temp[1]);
    temp = null;
    return result;
}
// 解析电影详情页面，获取下载地址，简介等等
const getMoiveInfos = function(moiveUrl) {
    return new Promise(async(resolve, reject) => {
        let moivesContents = await req(moiveUrl);
        if (moivesContents) {
            let moiveInfo = {};
            // 获取电影名称
            let tempReg = /<div class="title_all"><h1>(.*?)<\/h1><\/div>/gi;
            // let tempItor = moivesContents.matchAll(nameReg);
            moiveInfo.moiveName = parse(tempReg, moivesContents).toString();
            // 获取下载地址
            tempReg = /<li><a href="(jianpian.*?)">(?:.*)<\/a><\/li>/gis;
            moiveInfo.moiveDownloadJianpian = parse(tempReg, moivesContents);
            tempReg = /bgcolor="#fdfddf"><a href="(?:.*?)">(.*?)<\/a><\/td>/gis;
            moiveInfo.moiveDownloadMagnet = parse(tempReg, moivesContents);
            // 获取简介
            // 获取图片链接：
            tempReg = /<img.*?src="(.*?)" (?:style=.*)?.*?\/>/gi;
            moiveInfo.moiveImages = parse(tempReg, moivesContents);
            // 获取简介
            tempReg = /<!--Content Start-->(.*?)<!--jianpian Start-->/gis;
            let tempStr = parse(tempReg, moivesContents);
            tempStr.forEach(item => {
                moiveInfo.moiveBref = item.replace(/<(\S*?)[^>]*>.*?|<.*? \/>/ig, "\n"); // 替换掉简介中的标签
            });
            tempReg = null;
            tempStr = null;
            resolve(moiveInfo); //返回对象
        } else {
            reject("404 no such page");
        }
    });
};

// 主程序
const main = async function(url, type, pages = 10) {
    fs.mkdir(`./dy2018/${type}/`, {
        recursive: true,
    }, err => {
        err && console.log(err);
        !err && console.log(`${type} 目录创建成功!`);
        WriteFiles(`./dy2018/${type}/${type}.json`, '[').then(() => {
            console.log('文件创建成功！，开始写入数据');
        });
    });
    // 提取当前分类所有页面地址

    let contents = await req(url);
    let allPagesReg = /<option value='(.*?)'(?:.*?)<\/option>/gi;
    let allPagesUrls = parse(allPagesReg, contents);
    // 限制抓取页数
    if (pages < allPagesUrls.length) {
        allPagesUrls = allPagesUrls.slice(0, pages);
    }
    console.log(`${type}共有${allPagesUrls.length}页需要爬取\n`);
    let allMoivesUrl = [];
    let Counts = 1;
    // 控制并发
    let PagesFun = (pageUrl, callback) => {
        console.log(`正在抓取${type}的第${Counts++}个页面\n`);
        let TypeUrl = new URL(pageUrl, BASEURL);
        let pagePromise = parsrTypes(TypeUrl.toString());
        pagePromise.then((moiveUrls) => {
            // console.log(moiveUrls);
            callback(null, moiveUrls)
        });
    };
    let allPagesFun = (err, results) => {
        Counts = 1;
        results.forEach(item => {
            // console.log(item);
            allMoivesUrl.push(...item);
        });
        let MoivesFun = (moiveUrl, callback) => {
            console.log(`正在抓取第${Counts++}个电影页面，共${allMoivesUrl.length}个\n`);
            let moivePromise = getMoiveInfos(moiveUrl);
            moivePromise.then((moivedata) => {
                // console.log('页面爬取完成，正在写入数据');
                let moive = JSON.stringify(moivedata);
                WriteFiles(`./dy2018/${type}/${type}.json`, `${moive},`);
                callback(null, null);
            })
        };
        let allMoivesFun = (err, results) => {
            WriteFiles(`./dy2018/${type}/${type}.json`, ']').then((path) => {
                console.log('爬取完成，数据写入完毕！');
                console.log(`文件目录为：${path}`);
            });

            // console.log('爬取完成，正在写入数据');
            // let res = JSON.stringify(results);
            // WriteFiles(`./dy2018/${type}/${type}.json`, res).then((path) => {
            //     console.log(`爬取完毕,文件保存地址为：${path}`);
            // })
        };
        async.mapLimit(allMoivesUrl, 5, MoivesFun, allMoivesFun);
    };
    async.mapLimit(allPagesUrls, 5, PagesFun, allPagesFun);
};

const DY2018 = {
        type: ["剧情片",
            "喜剧片",
            "动作片",
            "爱情片",
            "科幻片",
            "动画片",
            "悬疑片",
            "惊悚片",
            "恐怖片",
            "纪录片",
            "音乐歌舞题材电影",
            "传记片",
            "历史片",
            "战争片",
            "犯罪片",
            "奇幻电影",
            "冒险电影",
            "灾难片",
            "武侠片",
            "古装片",
            "欧美电影",
            "日韩电影",
            "国内电影",
            "经典电影",
            "最新电影",
            "动漫资源",
            "综艺",
            "华语连续剧",
            "港台电视剧",
            "国产合拍剧",
            "欧美电视剧",
            "日韩电视剧"
        ],
        urls: [
            "/0/index.html",
            "/1/index.html",
            "/2/index.html",
            "/3/index.html",
            "/4/index.html",
            "/5/index.html",
            "/6/index.html",
            "/7/index.html",
            "/8/index.html",
            "/9/index.html",
            "/11/index.html",
            "/12/index.html",
            "/13/index.html",
            "/14/index.html",
            "/15/index.html",
            "/16/index.html",
            "/17/index.html",
            "/18/index.html",
            "/19/index.html",
            "/20/index.html",
            "/html/gndy/oumei/",
            "/html/gndy/rihan/",
            "/html/gndy/china/",
            "/html/gndy/jddyy/",
            "/html/gndy/dyzz/",
            "/html/dongman/index.html",
            "/html/zongyi2013/index.html",
            "/html/tv/hytv/index.html",
            "/html/tv/gangtai/index.html",
            "/html/tv/hepai/index.html",
            "/html/tv/oumeitv/index.html",
            "/html/tv/rihantv/index.html",
        ]
    }
    // 电影种类如下：
    // 1、剧情片
    // 2、喜剧片
    // 3、动作片
    // 4、爱情片
    // 5、科幻片
    // 6、动画片
    // 7、悬疑片
    // 8、惊悚片
    // 9、恐怖片
    // 10、纪录片
    // 11、音乐歌舞题材电影
    // 12、传记片
    // 13、历史片
    // 14、战争片
    // 15、犯罪片
    // 16、奇幻电影
    // 17、冒险电影
    // 18、灾难片
    // 19、武侠片
    // 20、古装片
    // 21、欧美电影
    // 22、日韩电影
    // 23、国内电影
    // 24、经典电影
    // 25、最新电影
    // 26、动漫资源
    // 27、综艺
    // 28、华语连续剧
    // 29、港台电视剧
    // 30、国产合拍剧
    // 31、欧美电视剧
    // 32、日韩电视剧
console.log('电影种类如下：');
DY2018.type.forEach((value, i) => {
    console.log(`${i+1}、${value}`);
});
console.log('-----------------------------');
let [type, page] = [25, 10]
let typeUrl = new URL(DY2018.urls[type - 1], BASEURL);
main(typeUrl.toString(), DY2018.type[type - 1], page);
// const r1 = readline.createInterface({
//     output: process.stdout, //终端输出
//     input: process.stdin, //终端输入
// });
// r1.on("close", () => {
//     process.exit(0);
// });
// r1.question('请输入选择想要爬取的电影种类：', types => {
//     let type = 1;
//     types = parseInt(types.toString().trim());
//     if (types >= 1 && types <= DY2018.urls.length) {
//         type = types - 1;
//         console.log(`您选取的种类为：${DY2018.type[type]}`);
//         r1.question('请输入选择想要爬取的总页数：', pages => {
//             let page = 10;
//             pages = parseInt(types.toString().trim());
//             if (pages >= 1) {
//                 page = pages - 1;
//                 console.log(`爬取的总页数为：${page}`);
//             } else {
//                 console.log('输入错误，请重新运行');
//                 r1.close();
//             }
//             console.log(type, page);
//         });

//     } else {
//         console.log('输入错误，请重新运行');
//         r1.close();
//     }
// });

// process.stdin.setEncoding("utf8");
// process.stdout.write("\n");
// process.stdout.write("请输入选择想要爬取的电影种类：");
// process.stdin.on("data", input => {
//     let types = 1;
//     input1 = parseInt(input.toString().trim());
//     if (input1 >= 1 && input <= DY2018.urls.length) {
//         types = input1 - 1;
//     }
//     process.stdout.write(`您选取的种类为：${DY2018.type[types]}`);
//     process.stdout.write("\n");
//     process.stdout.write(`请输入选择想要爬取的总页数：`);
//     process.stdin.on("data", input => {
//         let pages = 10;
//         input2 = parseInt(input.toString().trim());
//         if (input2 >= 1) {
//             pages = input2;
//         }
//         process.stdout.write(`爬取的总页数为：${pages}`);
//         let typeUrl = new URL(DY2018.urls[types], BASEURL);
//         main(typeUrl.toString(), DY2018.type[types], pages);
//         process.exit(0);
//     });
// });