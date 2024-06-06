"use strict";

/* exported Options */

function Options({ settings: {
  themes,
  defaultTheme,
  pageColorsOnInactive,
  usePageDefinedColors,
}}) {
  let tabs = Object.keys(themes).map((theme) => {
    return {
      id: theme,
      label: theme,
      component: ThemeEditor(themes[theme], Object.keys(themes).length > 1),
    };
  });
  let nightThemeDesc =
    "To disable this feature, choose the same theme as the default theme.";
  let pageColorDesc = "Select where the page color is extracted from:";
  return createElement("div", {},
    Section("General settings",
      createElement("h2", {}, "Page Colors"),
      createElement("p", {
        className: "disabled"
      }, pageColorDesc),
      Checkbox({
        label: "Use colors defined by the web page when available",
        defaultChecked: usePageDefinedColors,
        onChange: ({ target }) => {
          app.actions.setUsePageDefinedColors(target);
        }
      }),
      Checkbox({
        label: "Enable page colors on inactive windows",
        defaultChecked: pageColorsOnInactive,
        onChange: ({ target }) => {
          app.actions.setPageColorsOnInactive(target.checked);
        }
      }),
    ),

    Section("Themes",
      Tabs({
        selectedTab: app.state.selectedTab,
        tabs
      })
    ),
  );
}
