const SettingList = {
  themes: {
    defaultValue: {
      light: {
        images: {
          headerURL: ""
        },
        colors: {
          accentcolor: "#dedede",
          textcolor: "#000",
          toolbar_text: "#000",
          toolbar: "#f8f8f8",
        }
      },
      dark: {
        images: {
          headerURL: ""
        },
        colors: {
          accentcolor: "#000",
          textcolor: "#ddd",
          toolbar_text: "#ccc",
          toolbar: "#3a3a3a"
        }
      },
    }
  },
  rules: {
    defaultValue: [
      ["dark", "privatebrowsing"],
      ["dark", "(hour > 20) || (hour < 9)"],
    ]
  },
  defaultTheme: {
    defaultValue: "light",
  }
};

const Settings = {
  async get(setting) {
    try {
      const found = await browser.storage.local.get("settings." + setting);
      if (!found["settings." + setting]) {
        throw new Error();
      }
      return found["settings." + setting];
    } catch(e) { }
    return SettingList[setting].defaultValue;
  },

  async getBatch(settings) {
    let obj = {};
    for (let setting of settings) {
      obj[setting] = await this.get(setting);
    }
    return obj;
  },

  async set(setting, value) {
    await browser.storage.local.set({["settings." + setting]: value})
  },

  async setBatch(settings) {
    for (let setting in settings) {
      await this.set(setting, settings[setting]);
    }
  },

  onChanged(listener) {
    return browser.storage.onChanged.addListener(changes => {
      changes = Object.assign({}, changes);
      for (let change in changes) {
        if (!change.startsWith("settings.")) {
          delete changes[change];
        }
      }

      if (Object.keys(changes).length > 0) {
        listener(changes);
      }
    })
  }
}
