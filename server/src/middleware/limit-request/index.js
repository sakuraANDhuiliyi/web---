const RateLimit = require("koa2-ratelimit").RateLimit;

const createTimesLimiter = (options) => {
  if (!Object.getOwnPropertyNames(options).includes("prefixKey")) {
    console.error("TimesLimiterError, prefixKey is required");
  }

  const defaultOptions = {
    interval: 1 * 60 * 1000, // 1 minutes
    max: 10,
    prefixKey: "", // to allow the bdd to Differentiate the endpoint
    message: "请求过于频繁，请稍后再试",
    messageKey: "message",
  };
  Object.assign(defaultOptions, options);
  return RateLimit.middleware(defaultOptions);
};

module.exports = {
  createTimesLimiter,
};
