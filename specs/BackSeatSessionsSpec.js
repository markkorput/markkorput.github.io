describe("BackSeatSessions page", function() {
  beforeAll(function(){
    // before loading the backseat session pages, we'll turn all iframes into
    // dummy section elements, so the external pages aren't actually loaded
    $('template#backseatsessions').html($('template#backseatsessions').html().replace(new RegExp('iframe', 'g'), 'section'));
    $('template#backseatsessionsall').html($('template#backseatsessionsall').html().replace(new RegExp('iframe', 'g'), 'section'));
  });

  it("should have a link in the main menu", function(){
    $('#menu a:contains("Backseat Sessions")').click();
    expect($('.page h1:visible').text()).toBe('BackSeat Sessions');
  });

  it("should contain 3 youtube previews", function(){
    $('#menu a:contains("Backseat Sessions")').click();
    expect($('div.page section.youtube.small').length).toBe(3);
  });

  it("should have a link to load all episodes", function(){
    $('.page a:contains("show all episodes")').click();
    expect($('div.page section.youtube.small').length).toBeGreaterThan(39);
  });
});
