const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../../config/config.default");

const { ERRORCODE, throwError } = require("../../result/index");
const errorCode = ERRORCODE.AUTH; // 用户权限不足
const tokenErrorCode = ERRORCODE.AUTHTOKEN; // 用户登录过期

const getTokenFromHeader = (ctx) => {
  const { authorization } = ctx.request.header || {};
  if (!authorization) {
    return "";
  }
  return authorization.startsWith("Bearer ") ? authorization.replace("Bearer ", "") : authorization;
};

const parseUser = (ctx) => {
  const token = getTokenFromHeader(ctx);
  if (!token) {
    ctx.app.emit("error", throwError(tokenErrorCode, "您没有权限访问，请先登录"), ctx);
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    switch (err.name) {
      case "TokenExpiredError":
        ctx.app.emit("error", throwError(tokenErrorCode, "token已过期"), ctx);
        return null;
      case "JsonWebTokenError":
        ctx.app.emit("error", throwError(errorCode, "无效的token"), ctx);
        return null;
      default:
        ctx.app.emit("error", throwError(errorCode, "token校验失败"), ctx);
        return null;
    }
  }
};

const auth = async (ctx, next) => {
  const user = parseUser(ctx);
  if (!user) {
    return;
  }
  // user 中包含了 payload 信息（id、username、role）
  ctx.state.user = user;
  await next();
};

// 对需要管理员发布信息，但是不建议超级管理员发布信息的接口进行提示
const needAdminAuthNotNeedSuper = async (ctx, next) => {
  const user = ctx.state.user || parseUser(ctx);
  if (!user) {
    return;
  }
  const { role, username } = user;
  if (Number(role) !== 1) {
    return ctx.app.emit("error", throwError(errorCode, "普通用户仅限查看"), ctx);
  }
  if (username == "admin") {
    return ctx.app.emit("error", throwError(errorCode, "admin是配置的用户，没有用户信息，建议注册账号再发布博客内容"), ctx);
  }
  await next();
};

// 对需要管理员权限的进行操作进行提示
const needAdminAuth = async (ctx, next) => {
  const user = ctx.state.user || parseUser(ctx);
  if (!user) {
    return;
  }
  const { role } = user;
  if (Number(role) !== 1) {
    return ctx.app.emit("error", throwError(errorCode, "普通用户仅限查看"), ctx);
  }
  await next();
};

const isSuperAdmin = async (ctx, next) => {
  const user = ctx.state.user || parseUser(ctx);
  if (!user) {
    return;
  }
  const { username } = user;
  if (username == "admin") {
    return ctx.app.emit("error", throwError(errorCode, "管理员信息只可通过配置信息修改"), ctx);
  }
  await next();
};

module.exports = {
  auth,
  needAdminAuthNotNeedSuper,
  isSuperAdmin,
  needAdminAuth,
};
