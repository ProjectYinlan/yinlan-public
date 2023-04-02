
const Mirai = require('node-mirai-sdk');

const config = require('./config.json');

const mongo = require('./db');

mongo.connect();

require('./redis').connect();

const bot = new Mirai(config.bot);

// auth 认证(*)
bot.onSignal('authed', () => {
    console.log(bot.qq, "已登陆");
    bot.verify();
});

// session 校验回调
bot.onSignal('verified', async () => {
    console.log(bot.qq, "已校验");

    // 获取好友列表，需要等待 session 校验之后 (verified) 才能调用 SDK 中的主动接口
    const friendList = await bot.getFriendList();
    const groupList = await bot.getGroupList();
    console.log(bot.qq, `好友数量 ${friendList.length}`);
    console.log(bot.qq, `群数量 ${groupList.length}`);

    // 读入模块
    require('./loader');
});

bot.listen('all');

// 同步到全局变量
global.bot = bot;

// 退出前向 mirai-http-api 发送释放指令(*)
process.on('exit', () => {
    bot.release();
});