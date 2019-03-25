module.exports = {
  "env": {
    "es6": true,
    "browser": true,
    "webextensions": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "rules": {
    "brace-style": ["error", "1tbs"],
    "curly": ["error"],
    "eqeqeq": ["error"],
    "indent-legacy": ["error", 2],
    "key-spacing": ["error"],
    "keyword-spacing": ["error", {
        "before": true,
        "after": true
      }
    ],
    "no-console": [0],
    "no-multi-spaces": ["error"],
    "no-trailing-spaces": ["error"],
    "no-var": ["error"],
    "object-curly-spacing": ["error", "never"],
    "prefer-template": ["error"],
    "quotes": ["error", "double"],
    "semi": ["error", "always"],
    "space-before-blocks": ["error"]
  }
};
