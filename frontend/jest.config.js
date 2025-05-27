module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest', // For Vue 3 SFCs
    '^.+\\.tsx?$': 'ts-jest',       // For TypeScript files
    '^.+\\.jsx?$': 'babel-jest',    // If you have JS/JSX files and use Babel
  },
  moduleFileExtensions: ['vue', 'js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // To handle @/ path alias (common in Vue projects)
  },
  // setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'], // Optional: if you need global test setup
  // globals: { // Not typically needed for Vue 3 + ts-jest + @vue/vue3-jest
  //   'ts-jest': {
  //     // tsconfig: 'tsconfig.jest.json', // Optional: separate tsconfig for tests
  //   }
  // }
};
