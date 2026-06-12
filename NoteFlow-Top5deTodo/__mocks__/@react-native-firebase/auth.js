module.exports = () => ({
  currentUser: { uid: 'test-uid', email: 'test@test.com' },
  onAuthStateChanged: jest.fn(),
});