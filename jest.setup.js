// Increase timeout for all tests
jest.setTimeout(10000);

// Global teardown to ensure clean state
afterAll(async () => {
  // Add a small delay to ensure all async operations complete
  await new Promise(resolve => setTimeout(resolve, 100));
}); 