// 一个零依赖的模块，用于将环境变量从‌.env文件‌加载到‌process.env‌中
const dotenv = require("dotenv");
// 这里读取的是.env文件下的配置
dotenv.config();

// console.log(process.env)

module.exports = process.env;
