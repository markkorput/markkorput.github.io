// don't initialize this file's logic until the page is done (down-)loading.
$(document).ready(function(){

  // check for existing instance of this file's logic
  if(window.shortnotion){
    console.log('shortnotion logic already loaded?!');
    return;
  }

  // this will hold all this file's methods, classes and variables
  var scope = {};

  // backdropper generates backdrop content (decorative text in the background)
  scope.newBackdropper = function(opts){
    var backdropper = {
      initialize: function(options){
        this.txt = options.txt;
        this.el = options.el || $('#backdrop');
        this.lineCap = options.lineCap || 100;
        this.lineDelay = options.lineDelay || 5;
        this.lineCount = 0;
      },

      getContentLine: function(){
        // clear
        this.el.html('');
        // adding claibrating class disables word-wrap (which, when enabled,
        // never allows this element to reach greater width than the document element)
        this.el.addClass('calibrating');

        var highlight = 2 + Math.floor(Math.random() * 7);
        var cap = 100;
        for(var i=0; i<cap; i++){
          // this enough?
          if(this.wideEnough()){
            // this is the content we'll use for a single line
            var result = this.el.html();
            // reset element
            this.el.html('');
            this.el.removeClass('calibrating');
            // return result
            return result;
          }

          // add a piece of content
          if((i % highlight) == 0){
            this.el.append('<span class="highlight">'+this.txt+'</span>');
          } else {
            this.el.append(this.txt);
          }
        }

        console.log('backdrop line content cap reached');
        // reset element
        this.el.html('');
        this.el.removeClass('calibrating');
        // no backdrop content this time
        return '';
      },

      start: function(){
        var that = this;

        // we already know what content to use for each line?
        if(this.contentLine){
          // clear element
          this.el.html('');
          // start adding lines
          setTimeout(function(){ that.addLine(); });
          return;
        }

        setTimeout(function(){
          // first figure out the content to use for each line
          that.contentLine = that.getContentLine();
          // then start adding lines
          setTimeout(function(){
            that.addLine();
          });
        });
      },

      wideEnough: function(){
        return this.el.position().left + this.el.width() > $(document).width();
      },

      highEnough: function(){
        return this.el.position().top + this.el.height() > $(document).height();
      },

      addLine: function(){
        // cap reached?
        if(this.lineCount > this.lineCap){
          console.log('addLineCap reached');
          return;
        }

        // we're done
        if(this.highEnough()){
          return;
        }

        // add line
        this.el.append(this.contentLine);
        this.lineCount++;

        // schedule next line
        var that = this;
        setTimeout(function(){ that.addLine(); }, this.lineDelay);
      }
    };

    backdropper.initialize(opts);
    return backdropper;
  };

  // this backbone-based router handles site navigation
  scope.MarkRouter = Backbone.Router.extend({

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
      scope.showPage('shortnotion');
    },

    page: function(pageName){
      //console.log('page', pageName);
      scope.showPage(pageName);
    }
  });

  // callback method used by the router to load a specific page
  scope.showPage = function(pageName){
    $('.page').hide();
    $('.page#page-'+pageName).show();
    // console.log('loaded page: ' + pageName);

    var backdropper = scope.newBackdropper({txt: pageName});
    backdropper.start();
  }

  // initialize instance of our router and start monitoring for address changes
  scope.router = new scope.MarkRouter();
  // console.log('Backbone.history.start');
  Backbone.history.start({pushState: Backbone.history._hasPushState});

  // store scope for global (window-wide) reference
  window.shortnotion = scope;
});

