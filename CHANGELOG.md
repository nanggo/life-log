# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed

- **Testing Library Dependency Downgrade**: Downgraded `@testing-library/svelte` from v5.2.8 to v4.2.3
  - **Reason**: v5.x introduced breaking changes in the API that are not yet compatible with our current Svelte/SvelteKit setup
  - **Impact**: Maintains test stability while ensuring compatibility with existing component testing patterns
  - **Future**: Will upgrade to v5.x once our Svelte ecosystem is fully compatible

### Improved

- **Test Isolation**: Improved test isolation by replacing global `document.querySelector()` calls with scoped `container.querySelector()` in component tests
  - Files affected: `PostDate.test.ts`, `PostMeta.test.ts`, `Layout.test.ts`
  - This prevents test interference and improves reliability when running tests in parallel
