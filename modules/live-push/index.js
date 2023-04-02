/**
 * 直播推送
 */

const tag = "live-push";

const config = require('../../config.json').pulgins[tag];

const { WebSocket } = require('ws');

const utils = require('../../utils');

/**
 * index
 */
module.exports = connect;

async function connect() {

    console.log(tag, "初始化");

    const ws = new WebSocket(config.ws);

    ws.on('open', async () => {

        console.log(tag, "已连接推送服务");

        const groupList = (await global.bot.getGroupList()).map(e => e.id);

        await ws.send(JSON.stringify({
            type: 'online',
            data: {
                nodeId: bot.qq,
                groupList
            }
        }))

        console.log(tag, "已注册");

    });

    ws.on('message', (data) => {

        try {
            data = JSON.parse(data.toString());
        } catch (error) {
            return;
        }

        if (!data.type) return;

        switch (data.type) {

            // 推送
            case 'push':
                pushHandler(data.data);
                break;

            default:
                return;
        }

    });

    global.bot.on('leaveKick', (event) => {

        const group = event.group.id;
        ws.send(JSON.stringify({
            type: 'groupChange',
            data: {
                type: 'quit',
                group
            }
        }))

    })

    global.bot.on('leaveActive', (event) => {

        const group = event.group.id;
        ws.send(JSON.stringify({
            type: 'groupChange',
            data: {
                type: 'quit',
                group
            }
        }))

    })

    global.bot.on('joinGroup', (event) => {

        const group = event.group.id;
        ws.send(JSON.stringify({
            type: 'groupChange',
            data: {
                type: 'join',
                group
            }
        }))

    })

    ws.on('close', () => {
        console.log(tag, "推送服务连接关闭，5秒后正在重连");

        const retry = setTimeout(() => {
            console.log(tag, "正在重连……");
            connect();
        }, 5000)
    })

    ws.on('error', (error) => {
        console.error(tag, error.message);
        ws.close();
    })

}

async function pushHandler(payload) {

    const { groupList } = payload;

    if (groupList.length == 0) return;

    console.log(tag, `准备向 ${groupList.length} 个群推送`);

    let replyChain = [];
    let text = "";

    switch (payload.status) {

        case 'online':

            text = "";
            text += `${payload.username} 开播啦～\n`;
            text += `${payload.title}\n`;
            text += `${payload.startTimeStr}\n`;
            text += `${payload.roomUrl}\n`;

            replyChain.push({
                type: 'Plain',
                text
            })

            replyChain.push({
                type: 'Image',
                url: payload.coverUrl
            })

            break;

        case 'offline':

            text = "";
            text += `${payload.username} 下播啦～\n`;
            text += `本次直播 ${payload.durationTimeStr}`;

            replyChain.push({
                type: 'Plain',
                text
            })

            break;

        default:
            return;
    }

    for (let i = 0; i < groupList.length; i++) {

        const group = groupList[i];

        r = await global.bot.sendGroupMessage(replyChain, group.id);

        await utils.wait(1000);
        
    }

    console.log(tag, `推送完毕`);

}