import { app } from "./app.js";
import { msg } from "./msg.js";

export const api = {
  get url() {
    return app.specs.host;
  },
  async ping() {
    try {
      await fetch(`${this.url}/ping`)
        .then((response) =>
          msg.info(`Ping recv from myth with code ${response.status}`)
        )
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
    await fetch(`${this.url}/fetchKey?id=${id}&token=${app.specs.token}`)
      .then((response) => response.json())
      .then((data) => {
        try {
          msg.info(data.id, data.pwd);
          // navigator.clipboard.writeText(data.pwd);
          app.elems.loginQuery.value = data.pwd;
        } catch (error) {
          app.elems.errorLens.innerText = "无法访问系统剪贴板";
        }
      });
  },
  async submitConfig(pwdConfigParams) {
    // 配置提交接口
    await fetch(
      `${this.url}/submitConfig?rule=${pwdConfigParams.dateTimeRule}&prefix=${pwdConfigParams.prefix}&hashlength=${pwdConfigParams.hashLength}&s1s=${pwdConfigParams.seed1Segment}&s2s=${pwdConfigParams.seed2Segment}&suffix=${pwdConfigParams.suffix}`
    )
      .then((response) => response.json())
      .then((data) => {
        msg.info(data);
      });
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
