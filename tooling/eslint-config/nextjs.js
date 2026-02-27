/** @type {import('eslint').Linter.Config} */
const config = {
  plugins: ["@next/next"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
  },
};

module.exports = config;
