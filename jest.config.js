const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: ["**/*.test.ts"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      branches: 0.9,
      functions: 0.9,
      lines: 0.9,
      statements: 0.9
    }
  },
  // Force integration tests to run sequentially to avoid race conditions
  runner: "jest-runner",
  maxWorkers: 1
};