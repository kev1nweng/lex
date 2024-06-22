import { app } from "./app.js";
import { api } from "./api.js";
import { msg } from "./msg.js";

requestAnimationFrame(app.timeAnimator);
// const clipboard = new ClipboardJS("#copy-button");

// MDUI Initialization
function updatePWATheme() {
  document.getElementById("themeColor").content = `rgb(${getComputedStyle(
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
      } else {
        app.updateServerStatus(false);
      }
    })();
  });

if (!localStorage.getItem("myphlex-accent-color")?.length > 0) {
  localStorage.setItem("myphlex-accent-color", "#666666");
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

app.elems.getpwdButton.addEventListener("click", () => {
  app.elems.pwdcopyMsg.open = true;
  app.elems.copyButton.removeAttribute("disabled");
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
    onCancel: () => {
      return;
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
  app.elems.settingsDialog.open = app.elems.settingsDialog.open ? false : true;
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

msg.info("Init: Event listener registrations done");

if (app.specs.isiOSDevice) {
  msg.info("Init: iOS detected, adjusting layout");
  app.elems.navigationBar.style.marginBottom = "22px";
  app.elems.navigationBar.style.boxShadow = "none";
  app.elems.navigationBar.style.borderTop = "1px solid #8686863f";
}

updatePWATheme();

msg.info("Init: UI customizations done");
