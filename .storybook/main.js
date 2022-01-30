const path = require("path");

module.exports = {
  stories: [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "storybook-dark-mode",
  ],
  framework: "@storybook/react",
  webpackFinal: (config) => {
    config.resolve.alias["~"] = path.resolve(__dirname, "../src");
    return config;
  },
};
