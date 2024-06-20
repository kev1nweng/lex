export const app = {
  elems: {
    fullscreenCover: document.getElementById("fullscreen-cover"),
    navigationBar: document.getElementById("navigation-bar"),
    passwordTab: document.getElementById("password-tab"),
    aboutTab: document.getElementById("about-tab"),
    authenticatorTab: document.getElementById("authenticator-tab"),
    clock: document.getElementById("clock"),
    secretInput: document.getElementById("secret-input"),
    pwdcopyMsg: document.getElementById("pwdcopy-msg"),
    submitMsgFail: document.getElementById("submit-msg-fail"),
    submitButton: document.getElementById("submit-button"),
    getpwdButton: document.getElementById("getpwd-button"),
  },
  specs: {
    then: null,
    token: null,
    host: null,
    tokenExpireTime: null,
    leaving: null,
  },
  utils: {
    to2Digits: function (num) {
      if (num < 10) return "0" + num;
      else return num;
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
  updateTime() {
    if (app.specs.token) {
      if (!app.specs.tokenExpireTime) {
        const expiry = 10 * 60 * 1000;
        app.specs.tokenExpireTime = new Date(Date.now() + expiry);
      } else {
        const now = new Date();
        const timeLeft = app.specs.tokenExpireTime - now;
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds =
          Math.floor((timeLeft % (1000 * 60)) / 1000) < 10
            ? "0" + Math.floor((timeLeft % (1000 * 60)) / 1000)
            : Math.floor((timeLeft % (1000 * 60)) / 1000);
        this.elems.timeIndicator.innerText = `剩余有效会话时间`;
        this.elems.time.innerText = `${minutes}:${seconds}`;
        if (timeLeft < 0 && !app.specs.leaving) {
          app.specs.leaving = true;
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
