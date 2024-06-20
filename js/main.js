import { app } from "./app.js";
// import { api } from "./api.js";

requestAnimationFrame(app.timeAnimator);
// const clipboard = new ClipboardJS("#copy-button");

// MDUI Initialization
mdui.setColorScheme("#fff");
fetch("/config.json")
  .then((r) => r.json())
  .then((config) => {
    console.log("Setting color scheme");
    mdui.setColorScheme(config.customizations.accent_color);
    app.specs.host = config.api_host;
    console.log("Host: " + app.specs.host);
  });

window.addEventListener("load", () => {
  console.log("Setting navigation bar");
  app.elems.fullscreenCover.classList.add("hidden");
  app.elems.navigationBar.value = "password";
});

app.elems.navigationBar.addEventListener("change", () => {
  app.route("flex", "none");
});

app.elems.submitButton.addEventListener("click", () => {
  app.elems.submitMsgFail.open = true;
});

app.elems.getpwdButton.addEventListener("click", () => {
  app.elems.pwdcopyMsg.open = true;
});
