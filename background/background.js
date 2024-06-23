"use strict";

let currentTheme;

async function setColor({ windowId }) {
  let color, accent
  try {
    if ((color = (await browser.tabs.executeScript({ code: `getComputedStyle(document.body).getPropertyValue('--theme-color')` }))[0]))
      accent = (await browser.tabs.executeScript({ code: `getComputedStyle(document.body).getPropertyValue('--theme-accent')` }))[0]
    else if (!(color = (await browser.tabs.executeScript({ code: `document.querySelector('meta[media="(prefers-color-scheme: dark)"]')?.content` }))[0]))
      color = (await browser.tabs.executeScript({ code: `document.querySelector('meta[name="theme-color"]')?.content` }))[0]
  } catch { }
  let win = await browser.windows.get(windowId);
  let pageColorsOnInactive = await Settings.getPageColorsOnInactive();


  if (!color || color.match(/#f.f.f./i) || color.match(/rgba?\(2\d\d, *2\d\d, *2\d\d(, *\d*\.\d+)?\)/i) || (!pageColorsOnInactive && !win.focused)) {
    currentTheme.reset(windowId);
  } else {
    currentTheme.patch(color, "#fff", windowId, accent);
  }
}

new AddonState({
  async onInit() {
    let themes = await Settings.getThemes();

    currentTheme = new Theme(themes[window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light']);

    window.matchMedia('(prefers-color-scheme: dark)').onchange = async ({ matches }) => {
      currentTheme = new Theme(themes[matches ? 'dark' : 'light']);

      let tabs = await browser.tabs.query({ active: true });
      if (tabs.length == 0) return

      for (let tab of tabs) {
        setColor(tab)
      }
    }

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
