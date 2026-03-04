import http from "@/config/request";

const COLA_UID = import.meta.env.VITE_COLA_UID || "";
const COLA_APP_KEY = import.meta.env.VITE_COLA_APP_KEY || "";

/** 获取首页数据统计 */
export const homeGetStatistic = () => {
  return new Promise((resolve, reject) => {
    http.get("/api/statistic", {}).then((res) => {
      resolve(res);
    });
  });
};

/** 获取ColaKey */
export const getKey = () => {
  return new Promise((resolve, reject) => {
    if (!COLA_UID || !COLA_APP_KEY) {
      reject(new Error("Missing LuckyCola credentials: VITE_COLA_UID / VITE_COLA_APP_KEY"));
      return;
    }
    http
      .post("https://luckycola.com.cn/ai/getColaKey", {
        uid: COLA_UID,
        appKey: COLA_APP_KEY,
      })
      .then((res) => {
        resolve(res);
      });
  });
};

export const getSentence = (ColaKey) => {
  return new Promise((resolve, reject) => {
    http
      .post("https://luckycola.com.cn/tools/yiyan", {
        ColaKey,
      })
      .then((res) => {
        resolve(res);
      });
  });
};
