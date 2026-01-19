# Testing Setup

## Dependencies

For component tests to work, install the following packages:

```bash
bun add -d @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

## Test Structure

- **Component Tests**: `*.test.tsx` files alongside components
- **Storybook Tests**: Interaction tests in `*.stories.tsx` files using `@storybook/test`
- **Accessibility Tests**: Configured via `@storybook/addon-a11y`

## Running Tests

```bash
# Run all tests
bun test

# Run with UI
bun test:ui

# Run with coverage
bun test:coverage

# Run Storybook tests only
bun test:storybook
```

## Test Coverage Goals

- UI components: 80%+ coverage
- Complex components (Chat, Input): 70%+ coverage
- Simple components: 60%+ coverage
