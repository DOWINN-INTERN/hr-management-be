
beforeAll(async () => {
  // Any global setup you need before all tests
});

afterEach(async () => {
  // Clean database after each test but keep connection
  jest.clearAllMocks();
});

afterAll(async () => {
  // Additional cleanup if needed
});