// @ts-ignore
module.exports = {
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/test/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "~core(.*)$": "<rootDir>/libs/core/src/$1",
    "~react(.*)$": "<rootDir>/libs/react/src/$1",
    "~types(.*)$": "<rootDir>/libs/types/src/$1",
    "~undo-redo(.*)$": "<rootDir>/libs/undo-redo/src/$1",
  },
  globals: {
    "ts-jest": {
      isolatedModules: true,
      tsconfig: "tsconfig.base.json",
    },
  },
};
