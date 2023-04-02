/**
 * redis instance
 */

const redis = require('redis');

const config = require('./config.json');

const client = redis.createClient(config.redis);

client.on('connect', () => {
    console.log('redis', "初始化");
})

client.on('ready', () => {
    console.log('redis', "就绪");
})

module.exports = client;