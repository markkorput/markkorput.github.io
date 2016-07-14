// console.log("what's this");
function showPage(pageName){
  $('.page').hide();
  $('.page#page-'+pageName).show();
  // console.log('loaded page: ' + pageName);
}

// load page logic
$(document).ready(function(){
  // console.log('page load ok.');
  
  /*$('#menu a').click(function(){
    showPage($(this).prop('id'));
    return false;
  });*/

  var router = new MarkRouter();
  // console.log('Backbone.history.start');
  Backbone.history.start({pushState: Backbone.history._hasPushState});
});

var MarkRouter = Backbone.Router.extend({

  routes: {
    '': 'home',
    'page/:pagename': 'page'
  },

  initialize: function(options){
    var that = this;

    // console.log('router init');

    // // Trap links
    // $('body').delegate('a[href]:not([href^="#"])', 'click', function (e) {
    //   e.preventDefault();
    //   that.navigate($(this).attr('href'), {trigger: true});
    // });

    // Block anchors for hash-based history
    if (!Backbone.history._hasPushState) {
      $('body').delegate('a[href^="#"]', 'click', function (e) {
        e.preventDefault();
        that.navigate($(this).attr('href'), {trigger: true});
      });
    }
  },

  home: function(){
    showPage('home');
  },
/*
  execute: function(callback, args, name){
    console.log('whaaat');
  },*/

  page: function(pageName){
    //console.log('page', pageName);
    showPage(pageName);
  }

});
