/**
 * 模块加载器
 * Reference from ChatGPT (GPT-3.5)
 */

const path = require('path');
const moduleDir = path.join(__dirname, 'modules');
const replyModuleDir = path.join(__dirname, 'reply-modules');
const intervalModuleDir = path.join(__dirname, 'interval-modules');
const fs = require('fs');

// 读入并装载模块

console.log("modules", "读入模块");
fs.readdirSync(moduleDir).forEach((file) => {
    const modulePath = path.join(moduleDir, file);
    const stat = fs.statSync(modulePath);

    if (stat.isDirectory()) {
        const indexPath = path.join(modulePath, 'index.js');
        if (fs.existsSync(indexPath)) {
            const module = require(indexPath);
            module();
            console.log("modules", file);
        }
    }
});

console.log("reply-modules", "读入模块");
fs.readdirSync(replyModuleDir).forEach((file) => {
    const modulePath = path.join(replyModuleDir, file);
    const stat = fs.statSync(modulePath);

    if (stat.isDirectory()) {
        const indexPath = path.join(modulePath, 'index.js');
        if (fs.existsSync(indexPath)) {
            const module = require(indexPath);
            global.bot.onMessage(module);
            console.log("reply-modules", file);
        }
    }
});

console.log("interval-modules", "读入模块");
fs.readdirSync(intervalModuleDir).forEach((file) => {
    const modulePath = path.join(intervalModuleDir, file);
    const stat = fs.statSync(modulePath);

    if (stat.isDirectory()) {
        const indexPath = path.join(modulePath, 'index.js');
        if (fs.existsSync(indexPath)) {
            const module = require(indexPath);
            console.log("interval-modules", file);
        }
    }
});