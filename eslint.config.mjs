import react from "eslint-plugin-react";
import unusedImports from "eslint-plugin-unused-imports";
import _import from "eslint-plugin-import";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import jsxA11Y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-plugin-prettier";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [
      "node_modules",
      ".next",
      "dist",
      "build",
      "coverage",
      ".git",
      "public",
      "**/*.css",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
    settings: {
      "import/resolver": {
        alias: {
          map: [["@", "."]],
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        },
      },
    },
    plugins: {
      react,
      "@typescript-eslint": typescriptEslint,
      "jsx-a11y": jsxA11Y,
      import: _import,
      "unused-imports": unusedImports,
      prettier,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-console": "warn",
      "jsx-a11y/no-autofocus": "error",
      "prettier/prettier": "warn",
    },
  },
];