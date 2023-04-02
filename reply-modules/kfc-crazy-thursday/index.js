/**
 * 疯狂星期四
 */
const moduleName = "kfc-crazy-thursday";

const pendingExpire = 180;

const utils = require('../../utils')

const axios = require('axios').create({
    headers: {
        'user-agent': "Android KFCSuperApp,6.0.0,rn-0.59.10,kfc-ordering-preorder,null,null,13,Xiaomi M2102J2SC"
    }
});

/**
 * 
 * @param {require('node-mirai-sdk').message} message 
 * @returns 
 */
module.exports = async function (message) {

    let msg = '';
    let content = new Object;
    let flag = 0;

    message.messageChain.forEach(chain => {
        if (chain.type == 'Plain') msg += chain.text;
        if (chain.type == 'App') {
            flag ++;
            content = JSON.parse(chain.content);
        }
    })

    if (msg == ".疯狂星期四菜单" || msg == ".疯四菜单") {

        if ((new Date()).getDay() != 4) {
            message.reply("别急，还没到星期四。");
            return;
        }

        // 判断状态

        const status = utils.getModuleTempStatus(message, moduleName);

        if (status != 'pending') {

            r = await utils.setModuleTempStatus(message, moduleName, 'pending', pendingExpire);

            message.quoteReply(`请在${pendingExpire}秒内使用 位置 功能发送坐标。`);

            return;

        } else {

            message.quoteReply("上次请求仍在待处理状态。");

            return;

        }

    }

    if (flag == 0) return;

    if (content.app == 'com.tencent.map' && ((await utils.getModuleTempStatus(message, moduleName)) == 'pending')) {

        try {
            result = await axios({
                url: "https://rnorder.kfc.com.cn/preorder-portal/api/v2/init/combine/preorder",
                method: 'post',
                data: {
                    "portalType": "APP",
                    "channelName": "SuperApp",
                    "channelId": "13_2",
                    "brand": "KFC_PRE",
                    "business": "preorder",
                    "clientVersion": "v3.311(1bc4b66d)",
                    "env": "",
                    "body": {
                        "geoLocation": {
                            "lng": content.meta['Location.Search'].lng,
                            "lat": content.meta['Location.Search'].lat
                        }
                    }
                }
            }).then(r => r.data);

        } catch (error) {
            console.error(moduleName, error);
            return;
        }

        await utils.delModuleTempStatus(message, moduleName);

        // 状态码
        if (result.code != 0) {
            message.reply(result.code + " - " + result.msg);
            return;
        }

        const shopName = result.data.dataRecommend.stores[0].storename;

        const itemList = result.data.dataMenu.menuData[1].menuList.map(e => {
            return e.imageUrl ? {
                name: nameClean(e.nameCn),
                price: parseInt(e.price) / 100,
                image: e.imageUrl
            } : undefined;
        }).filter(Boolean);

        let replyMsg = shopName;

        itemList.forEach(e => {
            replyMsg += `\n${e.price}元 - ${e.name}`
        })

        message.reply(replyMsg);

    }

}

/**
 * 净化名称
 * @param {String} originText 
 */
function nameClean(originText) {
    return originText.replace(/(\d+\.9元?)|(BBN)/g, "");
}