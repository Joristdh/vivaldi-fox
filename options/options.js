"use strict";

/* global React, ReactDOM */
/* exported createElement, createFactory, Component */

var { createElement, createFactory, Component } = React;

var app;

const ALL_URLS = {
  origins: ["<all_urls>"]
};

async function init() {
  app = new StateManager({
    async renderer() {
      let root = document.getElementById("app");
      ReactDOM.render(Options(app.state), root);
    },
    initialState: {
      settings: {
        themes: processThemes(await Settings.getThemes()),
        defaultTheme: await Settings.getDefaultTheme(),
        pageColorsOnInactive: await Settings.getPageColorsOnInactive(),
        usePageDefinedColors: await Settings.getUsePageDefinedColors(),
      },
      selectedTab: await Settings.getDefaultTheme(),
    },
    actions: {
      setDefaultTheme(name) {
        this.state.settings.defaultTheme = name;
        Settings.setDefaultTheme(name);
      },
      setThemeProperty(theme, type, property, value) {
        let {themes} = this.state.settings;
        themes[theme].properties[type][property] = value;
        Settings.setThemes(themes);
      },
      setThemeOpacityProperty(theme, prop, value) {
        let {themes} = this.state.settings;
        if (!themes[theme].opacities) {
          themes[theme].opacities = {};
        }
        themes[theme].opacities[prop] = value;
        Settings.setThemes(themes);
      },
      setNativeTheme(theme, prop1, prop2, enabled) {
        let {themes} = this.state.settings;
        if (enabled) {
          delete themes[theme].properties.colors[prop1];
          if (prop2) {
            delete themes[theme].properties.colors[prop2];
          }
        } else {
          themes[theme].properties.colors[prop1] = "#ffffff";
          if (prop2) {
            themes[theme].properties.colors[prop2] = "#000000";
          }
        }
        Settings.setThemes(themes);
      },
      setThemeApplyPageColors(theme, prop1, prop2, value) {
        let {themes} = this.state.settings;
        let set = new Set(themes[theme].applyPageColors);
        if (value) {
          set.add(prop1);
          if (prop2) {
            set.add(prop2);
          }
        } else {
          set.delete(prop1);
          if (prop2) {
            set.delete(prop2);
          }
        }
        themes[theme].applyPageColors = [...set];
        Settings.setThemes(themes);
      },
      setPageColorsOnInactive(value) {
        this.state.settings.pageColorsOnInactive = value;
        Settings.setPageColorsOnInactive(value);
      },
      setUsePageDefinedColors(target) {
        let value = target.checked;
        const permissionsToRequest = {
          origins: ["<all_urls>"]
        }
        browser.permissions.request(permissionsToRequest).then((granted) => {
          if (granted) {
            this.state.settings.usePageDefinedColors = value;
            target.checked = value;
            Settings.setUsePageDefinedColors(value);
          } else {
            // Couldn't get permission, need to revert checkbox
            target.checked = false;
          }
        });
      }
    }
  });

  app.render();
}

function processThemes(themes) {
  for (let theme in themes) {
    if (!themes[theme].opacities) {
      themes[theme].opacities = {
        toolbar_field: 1,
        toolbar: 1,
      };
    }
  }
  return themes;
}

try {
  init();
} catch (e) {
  Settings.clear();
  alert("Corrupted add-on profile, please reload this page");
}
