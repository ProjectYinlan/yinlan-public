/**
 * Utils
 */

const ModuleStatus = require('./db/Schemas/ModuleStatus');

const redis = require('./redis');

const config = require('./config.json');

module.exports = {

    /**
     * 设置模块状态
     */
    async setModuleStatus(message, moduleName, status) {

        if (message.sender.permission == 'MEMBER' && !verifyAccess(message.sender.id)) {
            message.quoteReply("该命令仅限群主或管理员执行");
            return;
        }

        result = await ModuleStatus.updateMany({
            group: message.sender.group.id,
            details: {
                $elemMatch: {
                    module: moduleName,
                }
            }
        }, {
            $set: {
                "details.$.status": status
            }
        }, {
            new: true,
            multi: true
        })

        // 如果不存在，则新建 群/规则
        if (!result) {
            result = await ModuleStatus.findOneAndUpdate({
                group: message.sender.group.id
            }, {
                $addToSet: {
                    details: {
                        module: moduleName,
                        status: status
                    }
                }
            }, {
                upsert: true,
                new: true
            })
        }

        message.quoteReply("操作完毕");

    },

    async getModuleStatus(message, moduleName) {
        return await ModuleStatus.aggregate([
            {
                $match: {
                    group: message.sender.group.id
                }
            },
            {
                $unwind: "$details"
            },
            {
                $match: {
                    "details.module": moduleName
                }
            }
        ]).then(r => {
            if (r.length == 0) return 1
            else return r[0].details.status;
        });
    },

    async setModuleTempStatus (message, moduleName, status, expire) {

        if (message.type != 'GroupMessage') return;

        if (isNaN(expire)) expire = 180;

        return await redis.setEx(`haoran:${message.sender.group.id}:${message.sender.id}:${moduleName}`, expire, status);

    },

    async getModuleTempStatus (message, moduleName) {

        if (message.type != 'GroupMessage') return;

        return await redis.get(`haoran:${message.sender.group.id}:${message.sender.id}:${moduleName}`);

    },

    async delModuleTempStatus (message, moduleName) {

        if (message.type != 'GroupMessage') return;

        return await redis.del(`haoran:${message.sender.group.id}:${message.sender.id}:${moduleName}`);

    },

    /**
     * 确认是否有管理权限
     * @param {Number} qq QQ
     * @returns {Boolean} true 有，false 无
     */
    verifyAccess(qq) {

        switch (typeof (qq)) {
            case 'number':
                break;
            case 'object':
                qq = qq.sender.id;
                break;
        }

        for (let i = 0; i < config.manage.admin.length; i++) {
            const admin = config.manage.admin[i];
            if (admin == qq) {
                return true;
            }
        }

        return false;
    },

    // 延迟
    wait(time) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, time);
        })
    }

}