"use strict";

/* exported AddonState */

class AddonState {
  constructor({
    onTabColorChange,
    onWindowFocusChange,
    onInit
  }) {
    onTabColorChange = onTabColorChange.bind(this);
    onWindowFocusChange = onWindowFocusChange.bind(this);
    onInit = onInit.bind(this);

    browser.windows.onFocusChanged.addListener(onWindowFocusChange);
    browser.tabs.onActivated.addListener(async ({ tabId }) => onTabColorChange(await browser.tabs.get(tabId)));
    browser.tabs.onUpdated.addListener(async (_, { status }, tab) => {
      if (status != "loading" && tab.active) onTabColorChange(tab)
    }, { properties: ["status"] });


    this.refreshAddon = async () => {
      onInit();

      await new Promise(r => setTimeout(r, 400));

      let tabs = await browser.tabs.query({ active: true });
      if (tabs.length == 0) {
        return;
      }
      for (let tab of tabs) {
        if (tab.active) {
          onTabColorChange(tab);
        }
      }
    };

    Settings.onChanged(this.refreshAddon);
    onInit();
  }
}
