// Throwaway spec to test whether a failing test actually blocks a merge.
// Safe to delete — not part of any real feature.
describe('jest gate check', () => {
  it('deliberately fails', () => {
    expect(1 + 1).toBe(3);
  });
});
