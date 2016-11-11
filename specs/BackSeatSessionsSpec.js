describe("BackSeatSessions page", function() {
  // it("should have a page source template", function() {
  //   expect($('template.page#backseatsessions').length).toBe(1);
  // });

  it("should have a link in the main menu", function(){
    $('#menu a:contains("Backseat Sessions")').click();
    expect($('.page h1:visible').text()).toBe('BackSeat Sessions');
  });

  it("should contain 3 youtube previews", function(){
    $('#menu a:contains("Backseat Sessions")').click();
    expect($('.page #episodes iframe.youtube.small:visible').length).toBe(3);
  });

  it("should have a link to load all episodes", function(){
    $('.page a:contains("show all episodes")').click();
    expect($('.page #episodes iframe.youtube.small:visible').length).toBeGreaterThan(35);
  });
});
