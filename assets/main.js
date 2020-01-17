document.onscroll = function(e) {
  // shrink();
  var scroll_limit = 120;
  let upPostfix = ' up';

  let isUp = (document.body.scrollTop > scroll_limit || document.documentElement.scrollTop > scroll_limit);
  
  document.body.className = 
    document.body.className.replace(upPostfix, '') + (isUp ? upPostfix : ''); 
};