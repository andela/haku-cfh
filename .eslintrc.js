module.exports = {
    "extends": "airbnb-base",
    "plugins": [
      "import"
    ],
    "env": {
      "node": true,
      "browser": true,
      "mocha": true,
      "supertest": true,
    },
    "rules": {
       "require-jsdoc": ["error", {
        "require": {
            "FunctionDeclaration": true,
            "MethodDefinition": true,
            "ClassDeclaration": false,
            "ArrowFunctionExpression": false
        },
    }],
  }
};