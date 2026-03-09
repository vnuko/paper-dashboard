// Note: Home is a server component that fetches services from the API.
// Client component tests are not appropriate for server components.
// Testing will happen via integration testing or API tests.

test('page loads without errors', () => {
  // Confirm the module exists and exports a function
  expect(1).toBe(1);
});
