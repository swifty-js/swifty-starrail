import { defineConfig } from "eslint/config";
import tseslint from "@electron-toolkit/eslint-config-ts";
import eslintPluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";

export default defineConfig(
  { ignores: ["**/node_modules", "**/dist", "**/out"] },
  tseslint.configs.recommended,
  eslintPluginVue.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        extraFileExtensions: [".vue"],
        parser: tseslint.parser,
      },
    },
  },
  {
    files: ["**/*.{ts,mts,tsx,vue}"],
    rules: {
      "vue/require-default-prop": "off",
      "vue/multi-word-component-names": "off",
      "vue/block-lang": [
        "error",
        {
          script: {
            lang: "ts",
          },
        },
      ],
      // Prettier owns formatting; these stylistic rules conflict with it.
      "vue/max-attributes-per-line": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/html-self-closing": "off",
      "vue/html-indent": "off",
      // Toast contents come from the app's own message catalog, same trust
      // level as the React version's dangerouslySetInnerHTML.
      "vue/no-v-html": "off",
    },
  },
  // eslintConfigPrettier,
  {
    files: ["**/*.{js,mjs,jsx,ts,tsx,vue}"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
);
