# dy2018
电影天堂的爬虫

电影种类如下：
1、剧情片
2、喜剧片
3、动作片
4、爱情片
5、科幻片
6、动画片
7、悬疑片
8、惊悚片
9、恐怖片
10、纪录片
11、音乐歌舞题材电影
12、传记片
13、历史片
14、战争片
15、犯罪片
16、奇幻电影
17、冒险电影
18、灾难片
19、武侠片
20、古装片
21、欧美电影
22、日韩电影
23、国内电影
24、经典电影
25、最新电影
26、动漫资源
27、综艺
28、华语连续剧
29、港台电视剧
30、国产合拍剧
31、欧美电视剧
32、日韩电视剧


const BASEURL = "https://www.dy2018.com/";
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
    主函数需要传入的参数为：
url: 爬取的分类的url地址 如：https://www.dy2018.com/2/index.html
type: 爬取的分类名称
page: 爬取的页面数量，一般一页有25~30部电影

实际调用时，只需要改变 type 的索引值 和 page 值
依据数组可以拼接url地址
let [type, page] = [25, 10]
let typeUrl = new URL(DY2018.urls[type - 1], BASEURL);
main(typeUrl.toString(), DY2018.type[type - 1], page);
