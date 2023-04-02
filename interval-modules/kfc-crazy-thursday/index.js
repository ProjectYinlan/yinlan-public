/**
 * 疯狂星期四
 */

const moduleName = "kfc-crazy-thursday";
const CronJob = require('cron').CronJob;

const job0 = new CronJob('0 00 8 * * 4', index);
const job1 = new CronJob('0 00 17 * * 4', index);
const job2 = new CronJob('0 00 11 * * 4', index);

const config = require('../../config.json');
const proxy = config?.options.proxy || null;
const axios = require('axios').create({
    proxy
});

job0.start();
job1.start();
job2.start();

/**
 * index
 */
async function index() {

    console.log(moduleName, "开始执行");

    const ts = (new Date()).getTime();

    let chain = [];

    try {
        chain.push(await getText());
    } catch (error) {
        console.error(moduleName, error);
        return;
    }
    

    const groupList = await global.bot.getGroupList();

    console.log(moduleName, `共 ${groupList.length} 个群`);

    groupList.forEach(async group => {
        
        await global.bot.sendGroupMessage(chain, group.id);
        await wait(2000);

    });

    console.log(moduleName, `执行完毕，耗时 ${((new Date()).getTime() - ts) / 1000} 秒`);

}

/**
 * 获取文案
 */
async function getText() {

    let text = '';

    try {
        text = await axios.get("https://kfc-crazy-thursday.vercel.app/api/index").then(r => r.data);
    } catch (error) {
        throw error
    }

    return {
        type: 'Plain',
        text
    }

}

/**
 * wait
 * @param {Number} ms
 */
async function wait(ms) {
    return new Promise ((resolve) => {setTimeout(() => {resolve()}, ms)})
}