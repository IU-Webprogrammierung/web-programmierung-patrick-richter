import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import css from "@eslint/css";
import prettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.browser } },
  { files: ["**/*.css"], plugins: { css }, language: "css/css", extends: ["css/recommended"] },
  { files: ["**/*.js"], plugins: { prettier }, extends: ["prettier"] }, // Prettier-Plugin und Konfiguration
]);
