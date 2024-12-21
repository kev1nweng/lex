import { app } from "./app.js";
import { api } from "./api.js";
import { msg } from "./msg.js";

requestAnimationFrame(app.timeAnimator);

try {
  ClipboardJS, CryptoJS, eruda;
} catch (e) {
  mdui.alert({
    headline: "致命错误",
    description: "部分组件未正常加载，因此秘符灵匣无法继续运行。",
    confirmText: "重新加载",
    onConfirm: async () => {
      location.reload();
    },
  });
  msg.error(e);
}

// MDUI Initialization
function updatePWATheme() {
  document.getElementById("themeColor").content = `rgb(${getComputedStyle(
    document.documentElement
  ).getPropertyValue("--mdui-color-background")})`;
  document.getElementById("backgroundColor").content = `rgb(${getComputedStyle(
    document.documentElement
  ).getPropertyValue("--mdui-color-background")})`;
}

fetch("/config.json")
  .then((r) => r.json())
  .then((config) => {
    app.specs.host = config.api_host;
    msg.info("Init: Found host: " + app.specs.host);
    (async () => {
      if (await api.ping()) {
        app.updateServerStatus(true);
        if (!app.specs.setup) {
          mdui.snackbar({
            message: "您似乎是第一次使用秘符灵匣！请进行配置",
            closeable: true,
            closeOnOutsideClick: true,
            placement: "top",
          });
          app.elems.configDialog.open = true;
        }
      } else {
        app.updateServerStatus(false);
      }
    })();
  });

if (!localStorage.getItem("myphlex-accent-color")?.length > 0) {
  localStorage.setItem("myphlex-accent-color", "666666");
  mdui.setColorScheme("#666666");
} else {
  mdui.setColorScheme(localStorage.getItem("myphlex-accent-color"));
  app.elems.settingsAccentColorInput.value = localStorage.getItem(
    "myphlex-accent-color"
  );
}

window.addEventListener("load", () => {
  app.elems.fullscreenCover.classList.add("hidden");
  app.elems.navigationBar.value = "password";
});

app.elems.navigationBar.addEventListener("change", () => {
  app.route("flex", "none");
});

app.elems.submitButton.addEventListener("click", async () => {
  app.elems.submitButton.setAttribute("disabled", "");
  app.elems.submitButton.setAttribute("loading", "");
  if (await api.authenticate(app.elems.secretInput.value)) {
    app.updateServerStatus(await api.ping());
    app.elems.navigationBar.value = "password";
    mdui.snackbar({
      message: "秘符验证已通过",
      closeable: true,
      closeOnOutsideClick: true,
      placement: "top",
    });
    app.elems.submitButton.removeAttribute("loading");
    app.elems.submitButton.removeAttribute("disabled");
    app.elems.secretInput.value = "";
  } else {
    app.updateServerStatus(await api.ping());
    app.elems.submitButton.removeAttribute("loading");
    app.elems.submitButton.removeAttribute("disabled");
    app.elems.submitMsgFail.open = true;
  }
});

app.elems.resubmitAction.addEventListener("click", () => {
  app.elems.submitButton.click();
});

app.elems.getpwdButton.addEventListener("click", async () => {
  app.elems.getpwdButton.setAttribute("loading", "");
  app.elems.getpwdButton.setAttribute("disabled", "");
  if (!app.specs.token) {
    app.elems.getpwdButton.removeAttribute("loading");
    app.elems.getpwdButton.removeAttribute("disabled");
    mdui.snackbar({
      message: "请先通过时间秘符验证",
      closeable: true,
      closeOnOutsideClick: true,
      placement: "top",
    });
    return (app.elems.navigationBar.value = "authenticator");
  }
  if (await api.fetchKey(app.elems.passwordInput.value)) {
    app.elems.getpwdButton.removeAttribute("loading");
    app.elems.getpwdButton.removeAttribute("disabled");
    await app.utils.setClipboard(app.specs.thispwd);
    mdui.snackbar({
      message: `密码 ${
        app.specs.thispwd.length <= 8
          ? app.specs.thispwd
          : app.specs.thispwd.slice(
              0,
              Math.floor((app.specs.thispwd.length - 4) / 2)
            ) +
            "·".repeat(
              app.specs.thispwd.length -
                Math.floor((app.specs.thispwd.length - 4) / 2) -
                4
            ) +
            app.specs.thispwd.slice(
              Math.floor((app.specs.thispwd.length - 4) / 2) + 4
            )
      } 已复制到剪贴板`,
      closeable: true,
      closeOnOutsideClick: true,
      placement: "top",
    });
    app.elems.passwordInput.value = "";
  } else {
    app.elems.getpwdButton.removeAttribute("loading");
    app.elems.getpwdButton.removeAttribute("disabled");
    mdui.snackbar({
      message: "密码获取失败！请检查和秘符的连接状态",
      closeable: true,
      closeOnOutsideClick: true,
      placement: "top",
    });
  }
});

app.elems.reloadButton.addEventListener("click", async () => {
  await mdui.confirm({
    headline: "重新加载",
    description: "你确定要立即重新加载秘符灵匣吗？",
    confirmText: "重新加载",
    cancelText: "取消",
    onConfirm: async () => {
      msg.error("//////// RELOAD ////////");
      setTimeout(() => window.location.reload(), 500);
    },
  });
});

app.elems.secretInput.addEventListener("input", () => {
  if (app.elems.secretInput.value.length > 0) {
    app.elems.submitButton.removeAttribute("disabled");
  } else {
    app.elems.submitButton.setAttribute("disabled", "");
  }
});

app.elems.passwordInput.addEventListener("input", () => {
  if (app.elems.passwordInput.value.length > 0) {
    app.elems.getpwdButton.removeAttribute("disabled");
  } else {
    app.elems.getpwdButton.setAttribute("disabled", "");
  }
});

app.elems.settingsButton.addEventListener("click", () => {
  app.elems.settingsDialog.open = !app.elems.settingsDialog.open;
});

app.elems.setttingsAccentColorButton.addEventListener("click", () => {
  mdui.setColorScheme(app.elems.settingsAccentColorInput.value);
  localStorage.setItem(
    "myphlex-accent-color",
    app.elems.settingsAccentColorInput.value
  );
  updatePWATheme();
  mdui.snackbar({
    message: `主题颜色设置已保存 (#${app.elems.settingsAccentColorInput.value})`,
    closeable: true,
    closeOnOutsideClick: true,
    placement: "top",
  });
});

app.elems.erudaButton.addEventListener("click", async () => {
  mdui.confirm({
    headline: "启用调试工具",
    description: "你确定要启用调试工具吗？",
    confirmText: "启用",
    cancelText: "取消",
    onConfirm: async () => {
      eruda.init();
      msg.warn("//////// ERUDA ////////");
    },
  });
});

app.elems.configButton.addEventListener("click", () => {
  app.elems.configDialog.open = app.elems.configDialog.open ? false : true;
});

app.elems.configCancelButton.addEventListener("click", () => {
  app.elems.configDialog.open = false;
});

app.elems.overridesButton.addEventListener("click", () => {
  mdui.alert({
    headline: "秘符覆写",
    description:
      "该功能尚未完成开发。您即将打开一个测试页面，用于预览尚未完成的功能。部分或所有功能可能无法正常工作。",
    confirmText: "继续",
    onConfirm: async () => {
      app.elems.overridesDialog.open = true;
    },
  });
});

app.elems.overridesExitButton.addEventListener("click", () => {
  app.elems.overridesDialog.open = false;
});

app.elems.configApplyButton.addEventListener("click", async () => {
  app.elems.configApplyButton.setAttribute("loading", "");
  app.elems.configApplyButton.setAttribute("disabled", "");
  if (
    await api.submitConfig({
      rule: app.elems.configRule.value,
      prefix: app.elems.configPrefix.value,
      suffix: app.elems.configSuffix.value,
      hashLength: app.elems.configHashlen.value,
      seed1: app.elems.configSeed1.value,
      seed2: app.elems.configSeed2.value,
    })
  ) {
    mdui.snackbar({
      message: "配置应用成功！",
      closeable: true,
      closeOnOutsideClick: true,
      placement: "top",
    });
    app.elems.configDialog.open = false;
    app.elems.configApplyButton.removeAttribute("loading");
    app.elems.configApplyButton.removeAttribute("disabled");
  } else {
    mdui.snackbar({
      message:
        "配置应用失败！服务器是否不在线？若您不是第一次进行设置，您是否尚未通过秘符验证？",
      closeable: true,
      closeOnOutsideClick: true,
      placement: "top",
    });
    app.elems.configApplyButton.removeAttribute("loading");
    app.elems.configApplyButton.removeAttribute("disabled");
  }
});

app.elems.passwordInput.addEventListener("keydown", async (evt) => {
  if (evt.key === "Enter" || evt.keyCode === 13) {
    app.elems.getpwdButton.click();
  }
});

app.elems.secretInput.addEventListener("keydown", async (evt) => {
  if (evt.key === "Enter" || evt.keyCode === 13) {
    app.elems.submitButton.click();
  }
});

msg.info("Init: Event listener registrations done");

if (app.specs.isiOSDevice) {
  msg.info("Init: iOS device detected, adjusting layout");
  app.elems.navigationBar.style.marginBottom = "22px";
  app.elems.navigationBar.style.boxShadow = "none";
  app.elems.navigationBar.style.borderTop = "1px solid #8686863f";
}

updatePWATheme();

msg.info("Init: UI customizations done");

// Keyboard shortcuts
window.addEventListener("keydown", (evt) => {
  // msg.info(`keydown: ${evt.keyCode}`);
  switch (evt.keyCode) {
    case 219:
      app.elems.navigationBar.value = "authenticator";
      break;
    case 221:
      app.elems.navigationBar.value = "password";
      break;
    case 220:
      app.elems.navigationBar.value = "about";
      break;
    case 192:
      switch (app.elems.navigationBar.value) {
        case "authenticator":
          app.elems.secretInput.focus();
          evt.preventDefault();
          break;
        case "password":
          app.elems.passwordInput.focus();
          evt.preventDefault();
          break;
        default:
          break;
      }
    default:
      break;
  }
});

msg.info("Init: Keyboard shortcuts registered");

const clipboard = new ClipboardJS("#copy-button");

clipboard.on("success", function (e) {
  e.clearSelection();
});

clipboard.on("error", function (e) {
  mdui.alert({
    headline: "错误",
    description: `未能将密码写入设备剪贴板。请尝试升级您的浏览器，或者更换设备重试。秘符灵匣将尝试显示您的密码用于手动输入：${e.text}`,
    confirmText: "退出",
    onConfirm: async () => {
      location.reload();
    },
  });
  msg.error(e);
});

document.body.style.overflow = "hidden";  // Prevent scrolling
