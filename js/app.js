const elems = {
  fullscreenCover: document.getElementById("fullscreen-cover"),
  navigationBar: document.getElementById("navigation-bar"),
};

mdui.setColorScheme("#fff");

// MDUI Initialization
fetch("/config.json")
  .then((r) => r.json())
  .then((config) => {
    console.log("Setting color scheme");
    mdui.setColorScheme(config.customizations.accent_color);
  });

window.addEventListener("load", () => {
  console.log("Setting navigation bar");
  elems.fullscreenCover.classList.add("hidden");
  elems.navigationBar.value = "password";
});
