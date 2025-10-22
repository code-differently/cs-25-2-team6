/** @type {import("jest").Config} **/
module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  testEnvironment: "jsdom",
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        babelConfig: {
          presets: [
            ['@babel/preset-env', { targets: { node: 'current' } }],
            '@babel/preset-typescript',
            ['@babel/preset-react', { runtime: 'automatic' }]
          ]
        }
      }
    ]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
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