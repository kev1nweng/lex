import { api } from "./api.js";
import { msg } from "./msg.js";

export const app = {
  elems: {
    fullscreenCover: document.getElementById("fullscreen-cover"),
    navigationBar: document.getElementById("navigation-bar"),
    settingsDialog: document.getElementById("settings-dialog"),
    configDialog: document.getElementById("config-dialog"),
    passwordTab: document.getElementById("password-tab"),
    aboutTab: document.getElementById("about-tab"),
    authenticatorTab: document.getElementById("authenticator-tab"),
    clock: document.getElementById("clock"),
    configClock: document.getElementById("config-clock"),
    configRule: document.getElementById("config-rule"),
    configPrefix: document.getElementById("config-prefix"),
    configSuffix: document.getElementById("config-suffix"),
    configSeed1: document.getElementById("config-seed1"),
    configSeed2: document.getElementById("config-seed2"),
    configHashlen: document.getElementById("config-hashlen"),
    reloadButton: document.getElementById("reload-button"),
    settingsButton: document.getElementById("settings-button"),
    erudaButton: document.getElementById("eruda-button"),
    configButton: document.getElementById("config-button"),
    configCancelButton: document.getElementById("config-cancel-button"),
    configApplyButton: document.getElementById("config-apply-button"),
    resubmitAction: document.getElementById("resubmit-action"),
    passwordInput: document.getElementById("password-input"),
    secretInput: document.getElementById("secret-input"),
    pwdcopyMsg: document.getElementById("pwdcopy-msg"),
    submitMsgFail: document.getElementById("submit-msg-fail"),
    srvdownMsg: document.getElementById("srvdown-msg"),
    submitButton: document.getElementById("submit-button"),
    getpwdButton: document.getElementById("getpwd-button"),
    statusIndicator: document.getElementById("status-indicator"),
    settingsAccentColorInput: document.getElementById(
      "settings-accent-color-input"
    ),
    setttingsAccentColorButton: document.getElementById(
      "settings-accent-color-button"
    ),
  },
  specs: {
    then: null,
    token: null,
    host: null,
    tokenExpireTime: null,
    expiryFormated: null,
    leaving: null,
    thispwd: null,
    isiOSDevice:
      (navigator.userAgent.includes("iPhone OS") ||
        navigator.userAgent.includes("iPad OS") ||
        navigator.userAgent.includes("Mac OS X")) &&
      (!navigator.userAgent.includes("Mac OS X") || true), // debug
    hash: null,
    setup: false,
  },
  utils: {
    to2Digits: function (num) {
      if (num < 10) return "0" + num;
      else return num;
    },
    setClipboard: async function (text) {
      const type = "text/plain";
      const blob = new Blob([text], { type });
      const data = [new ClipboardItem({ [type]: blob })];
      try {
        navigator.clipboard.write(data).then(
          () => {
            msg.info("Clipboard: write success");
          },
          () => {
            throw new Error("Clipboard: write failed");
          }
        );
      } catch (error) {
        msg.error(error.message);
        return false;
      }
      return true;
    },
  },
  timeAnimator() {
    if (app.specs.then) null;
    else app.specs.then = Date.now();
    const interval = 1000 / 5;
    const now = Date.now();
    const delta = now - app.specs.then;
    if (delta >= interval) {
      app.specs.then = now - (delta % interval);
      app.updateTime();
    }
    requestAnimationFrame(app.timeAnimator);
  },
  updateServerStatus(state) {
    if (state) {
      const onlineState = "秘符：在线";
      this.elems.statusIndicator.removeAttribute("loading");
      this.elems.statusIndicator.setAttribute("icon", "cast--rounded");
      this.elems.statusIndicator.style.color = "";
      this.elems.statusIndicator.onclick = async () => {
        await mdui.confirm({
          headline: `秘符已连接`,
          description: `认证状态：${
            this.specs.token ? "是" : "否"
          }⠀会话剩余时间：${this.specs.expiryFormated ?? "无"}`,
          confirmText: "注销会话",
          cancelText: "取消",
          onConfirm: async () => {
            if (await api.reset()) {
              this.specs.token = null;
              this.specs.tokenExpireTime = null;
              this.specs.expiryFormated = null;
              this.updateServerStatus(await api.ping());
              mdui.snackbar({
                message: "会话已注销",
                closeable: true,
                closeOnOutsideClick: true,
                placement: "top",
              });
            }
          },
          oncancel: () => {
            return;
          },
        });
      };
      this.elems.passwordTab.open = true;
      msg.info(`Updated server status with token "${this.specs.token}"`);
      const authState = this.specs.token ? "已认证" : "未认证";
      this.elems.statusIndicator.innerText = `${onlineState} (${authState})`;
    } else {
      this.elems.statusIndicator.innerText = "秘符：离线";
      this.elems.statusIndicator.removeAttribute("loading");
      this.elems.statusIndicator.setAttribute("icon", "close--rounded");
      this.elems.statusIndicator.style.color = "crimson";
      this.elems.statusIndicator.onclick = () => {
        this.elems.srvdownMsg.open = true;
      };
    }
  },
  updateTime() {
    if (this.specs.token) {
      if (!this.specs.tokenExpireTime) {
        const expiry = 10 * 60 * 1000;
        this.specs.tokenExpireTime = new Date(Date.now() + expiry);
      } else {
        const now = new Date();
        const timeLeft = this.specs.tokenExpireTime - now;
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds =
          Math.floor((timeLeft % (1000 * 60)) / 1000) < 10
            ? "0" + Math.floor((timeLeft % (1000 * 60)) / 1000)
            : Math.floor((timeLeft % (1000 * 60)) / 1000);
        this.specs.expiryFormated = `${minutes}min ${seconds}sec`;
        if (timeLeft < 0 && !this.specs.leaving) {
          this.specs.leaving = true;
          location.reload();
        }
      }
    } else {
      const timeNow = new Date();
      this.elems.clock.innerText = `${
        timeNow.getFullYear() % 100
      }.${this.utils.to2Digits(timeNow.getMonth() + 1)}.${this.utils.to2Digits(
        timeNow.getDate()
      )} ${this.utils.to2Digits(timeNow.getHours())}:${this.utils.to2Digits(
        timeNow.getMinutes()
      )}:${this.utils.to2Digits(timeNow.getSeconds())}`;
      this.elems.clock.style.color =
        60 - timeNow.getSeconds() <= 10 ? "crimson" : "inherit";
      this.elems.secretInput.setAttribute(
        "helper",
        60 - timeNow.getSeconds() <= 10 ? "请注意，秘符可能即将改变。" : "　"
      );
      if (this.elems.realTimeExample) {
        this.elems.realTimeExample.innerText = `d1-d4-t2-t6 在此刻表示为 "${(
          timeNow.getFullYear() % 100
        )
          .toString()
          .substring(0, 1)}${new String(
          this.utils.to2Digits(timeNow.getMonth() + 1)
        ).substring(1, 2)}${new String(
          this.utils.to2Digits(timeNow.getHours())
        ).substring(1, 2)}${new String(
          this.utils.to2Digits(timeNow.getSeconds())
        ).substring(1, 2)}"`;
      }
    }
  },
  route(dState, hState) {
    switch (this.elems.navigationBar.value) {
      case "password":
        this.elems.passwordTab.style.display = dState;
        this.elems.aboutTab.style.display = hState;
        this.elems.authenticatorTab.style.display = hState;
        break;
      case "about":
        this.elems.aboutTab.style.display = dState;
        this.elems.passwordTab.style.display = hState;
        this.elems.authenticatorTab.style.display = hState;
        break;
      case "authenticator":
        this.elems.authenticatorTab.style.display = dState;
        this.elems.passwordTab.style.display = hState;
        this.elems.aboutTab.style.display = hState;
        break;
      default:
        console.error("Navigation bar value is invalid");
    }
  },
};
