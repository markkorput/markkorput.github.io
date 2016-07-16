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

      // determine the content of a single line by clearing the element,
      // than adding this.txt until the element has become wide enough to
      // fill the window
      getContentLine: function(){
        // clear
        this.el.html('');
        // adding claibrating class disables word-wrap (which, when enabled,
        // never allows this element to reach greater width than the document element)
        this.el.addClass('calibrating');

        var highlight = 1 + Math.floor(Math.random() * 10);
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

      // clear element and schedule calls to fill it up with new content
      start: function(){
        var that = this;

        // we already know what content to use for each line?
        if(this.contentLine){
          // clear element
          this.el.html('');
          // start adding lines
          that.timeout = setTimeout(function(){ that.addLine(); });
          return;
        }

        that.timeout = setTimeout(function(){
          // first figure out the content to use for each line
          that.contentLine = that.getContentLine();
          // then start adding lines
          that.timeout = setTimeout(function(){
            that.addLine();
          });
        });
      },

      // stops any scheduled timeout
      stop: function(){
        if(this.timeout){
          clearTimeout(this.timeout);
          this.timeout = undefined;
        }
      },

      // returns a boolean, indicating if the element with the current content,
      // has become wide enough to fill the window
      wideEnough: function(){
        return this.el.position().left + this.el.width() > $(document).width();
      },

      // returns a boolean, indicating if the element with the current content,
      // has become high enough to fill the window
      highEnough: function(){
        return this.el.position().top + this.el.height() > $(document).height();
      },

      // adds a line of content to this.el and schedules the next call to addLine
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
        this.timeout = setTimeout(function(){ that.addLine(); }, this.lineDelay);
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
    var template_el = $('template.page#'+pageName);
    var content = ''

    if(template_el.length > 0){
      // console.log('found template');
      content = template_el.html();
    }

    var page_el = $('div.page');
    page_el.prop('class', 'page ' + pageName)
    page_el.html(content);
    page_el.show();

    if(scope.backdropper)
      scope.backdropper.stop();

    scope.backdropper = scope.newBackdropper({txt: pageName});
    scope.backdropper.start();
  }

  // register keydown-handler
  $(window).on('keydown', function(event){
    // for debugging; press the slash key to toggle between styling versions
    if(event.key == '/'){
      // console.log('toggle version2');
      $('#menu').toggleClass('version2');
    }
  });

  // initialize instance of our router and start monitoring for address (anchor) changes
  scope.router = new scope.MarkRouter();
  // console.log('Backbone.history.start');
  Backbone.history.start({pushState: Backbone.history._hasPushState});

  // store scope for global (window-wide) reference
  window.shortnotion = scope;
});