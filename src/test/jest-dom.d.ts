import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}

  interface AsymmetricMatchersContaining
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extends TestingLibraryMatchers<any, void> {}
}
