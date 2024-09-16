import { app } from "./app.js";
import { msg } from "./msg.js";

export const api = {
  get url() {
    return location.host.includes("localhost")
      ? "http://localhost:4518"
      : app.specs.host;
  },
  async ping() {
    try {
      await fetch(`${this.url}/ping`)
        .then((response) => response.json())
        .then((data) => {
          app.specs.hash = data.fingerprint;
          app.specs.setup = JSON.parse(data.setup);
        })
        .catch((e) => {
          throw new Error("Ping failed with", e);
        });
      return true;
    } catch (e) {
      msg.warn(`Failed to connect to myph instance at ${app.specs.host}`);
      return false;
    }
  },
  async reset() {
    await this.authenticate("-logout-");
    msg.warn("//////// STATUS RESET ////////");
    return true;
  },
  async authenticate(key) {
    // 动态日期密码验证接口
    try {
      await fetch(`${this.url}/auth/${key}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.access) {
            app.specs.token = data.token;
          } else {
            throw new Error("Incorrect key");
          }
        });
      return true;
    } catch (error) {
      return false;
    }
  },
  async fetchKey(id) {
    // 密码获取接口
    try {
      const hash = CryptoJS.SHA1(id.toString().toUpperCase());
      await fetch(`${this.url}/fetchKey?id=${hash}&token=${app.specs.token}`)
        .then((response) => response.json())
        .then((data) => {
          try {
            app.specs.thispwd = data.pwd;
          } catch (error) {
            throw new Error("获取密钥失败：", error);
          }
        });
      return true;
    } catch (error) {
      return false;
    }
  },
  async submitConfig(query) {
    // 配置提交接口
    try {
      await fetch(
        `${this.url}/submitConfig?rule=${query.rule}&prefix=${query.prefix}&hashlength=${query.hashLength}&s1s=${query.seed1}&s2s=${query.seed2}&suffix=${query.suffix}&token=${app.specs.token}`
      )
        .then((response) => response.json())
        .then((data) => {
          msg.info(data);
        })
        .catch((e) => {
          throw new Error("Failed to apply configuration: ", e);
        });
    } catch (error) {
      return false;
    }
    return true;
  },
  async submitOverrides(arr) {
    let payloadArr = [];
    arr.forEach((obj) => {
      payloadArr.push(
        `${obj.type == "symlink" ? "s" : "p"}*${obj.origin}*${
          obj.type == "symlink" ? obj.target : obj.content
        }`
      );
    });

    let paylaodStr = "";
    payloadArr.forEach((item) => {
      paylaodStr += paylaodStr.length == 0 ? item : `&${item}`;
    });

    try {
      await fetch(
        `${this.url}/submitOverrides?token=${app.specs.token}&payloads=${paylaodStr}`
      )
        .then((response) => response.json())
        .then((data) => {
          msg.info(data);
        })
        .catch((e) => {
          throw new Error("Failed to apply overrides: ", e);
        });
    } catch (error) {
      return false;
    }
    return true;
  },
  async getServerConfigStatus() {
    // 获取服务器状态接口
    await fetch(`${this.url}/cfgStatus`)
      .then((response) => response.json())
      .then((data) => {
        if (data.configured == true) {
          msg.info("Server properly configured");
        } else {
          location.replace(`${location.protocol}//${location.host}/configure`);
        }
      });
  },
};
