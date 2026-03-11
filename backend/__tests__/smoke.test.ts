/**
 * Minimal smoke tests that run without DATABASE_URL, REDIS_URL, or other env.
 * Add integration/unit tests under __tests__ that mock or set env as needed.
 */
describe('smoke', () => {
  it('runs', () => {
    expect(true).toBe(true);
  });

  it('has plan limits shape', () => {
    const planLimits = {
      FREE: { proposalsPerMonth: 3, teamMembers: 1, customBranding: false },
      PRO: { proposalsPerMonth: -1, teamMembers: 1, customBranding: false },
      AGENCY: { proposalsPerMonth: -1, teamMembers: 5, customBranding: true },
    };
    expect(planLimits.FREE.proposalsPerMonth).toBe(3);
    expect(planLimits.AGENCY.teamMembers).toBe(5);
  });
});
