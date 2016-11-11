describe("BackSeatSessions page", function() {
  it("should have a page source template", function() {
    expect($('template.page#backseatsessions').length).toBe(1);
  });
});
