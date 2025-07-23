jest.mock('./src/constants', () => {
  return {
    entryPointUriPath: 'test',
    PERMISSIONS: { View: 'ViewTest', Manage: 'ManageTest' },
  };
});
