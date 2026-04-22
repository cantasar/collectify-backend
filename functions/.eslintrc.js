module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/generated/**/*", // Ignore generated files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "import/no-unresolved": 0,
    "valid-jsdoc": 0,
    "require-jsdoc": 0,
    "new-cap": ["error", { capIsNew: false }],
  },
  overrides: [
    {
      // JS config files (e.g. this file) are outside the TS project — skip
      // type-aware parsing so ESLint doesn't need a tsconfig covering them.
      files: ["*.js"],
      parserOptions: { project: null },
    },
  ],
};
