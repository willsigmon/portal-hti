const expoConfig = require("eslint-config-expo/flat");

module.exports = [
  ...expoConfig,
  {
    ignores: ["dist/**", "web-build/**"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
];
