/** @type {import('eslint').Linter.Config} */
const config = {
  extends: ["plugin:@next/next/recommended-legacy"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
  },
};

module.exports = config;
