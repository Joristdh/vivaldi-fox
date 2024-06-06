"use strict";

let currentTheme;

async function setColor({ windowId }) {
  let color
  try {
    if (!(color = (await browser.tabs.executeScript({ code: `document.querySelector('meta[media="(prefers-color-scheme: dark)"]')?.content` }))[0]))
      color = (await browser.tabs.executeScript({ code: `document.querySelector('meta[name="theme-color"]')?.content` }))[0]
  } catch { }
  let win = await browser.windows.get(windowId);
  let pageColorsOnInactive = await Settings.getPageColorsOnInactive();


  if (!color || color.match(/#f.f.f./) || (!pageColorsOnInactive && !win.focused)) {
    currentTheme.reset(windowId);
  } else {
    currentTheme.patch(color.toString(), "", windowId);
  }
}

new AddonState({
  async onInit() {
    let themes = await Settings.getThemes();

    currentTheme = new Theme(themes[window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light']);

    window.matchMedia('(prefers-color-scheme: dark)').onchange = ({ matches }) => currentTheme = new Theme(themes[matches ? 'dark' : 'light']);

    let isFirstRun = await Settings.getIsFirstRun();
    if (isFirstRun && !await browser.permissions.contains({ origins: ["<all_urls>"] })) {
      chrome.tabs.create({
        url: chrome.runtime.getURL("/welcome/welcome.html")
      });
    }
    if (isFirstRun) Settings.setIsFirstRun(false);
  },
  onTabColorChange(tab) {
    return setColor(tab);
  },
  async onWindowFocusChange(focusedWindowId) {
    let tabs = await browser.tabs.query({ active: true });
    if (tabs.length == 0) return

    for (let tab of tabs) {
      if (tab.windowId == focusedWindowId) setColor(tab)
    }
  }
});

browser.browserAction.onClicked.addListener(() => {
  browser.runtime.openOptionsPage();
});
