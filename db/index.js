/**
 * mongo instance
 */

const tag = "mongo";

const mongoose = require('mongoose');

const config = require('../config.json').mongo;

module.exports = {

    /**
     * 连接
     */
    connect: function () {
        new Promise((resolve, reject) => {
            mongoose.set("strictQuery", true);
            mongoose.connect(`mongodb://${config.user}:${config.pwd}@${config.host}/${config.db}`, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
    
            mongoose.connection.once('open', (err) => {
                if (!err) {
                    console.log(tag, "就绪")
                    resolve()
                } else {
                    reject('数据库连接失败' + err)
                }
            })
        })
    },

    
    schemas: {
        
        ModuleStatus: require('./Schemas/ModuleStatus')

    }

}