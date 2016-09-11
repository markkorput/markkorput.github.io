// don't initialize this file's logic until the page is done (down-)loading.
$(document).ready(function(){
  // check for existing instance of this file's logic
  if(window.shortnotionjs){
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
        this.idleDelay = options.idleDelay || 3000;
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

        // console.log('backdrop line content cap reached');
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
          // console.log('addLineCap reached');
          return;
        }

        // we're done
        var that = this;

        if(this.highEnough()){
          // on mobile devices often the background never gets filled up completely,
          // so we'll just keep an idle (slow) timeout running to keep filling up
          this.timeout = setTimeout(function(){ that.addLine(); }, this.idleDelay);
          return;
        }

        // add line
        this.el.append(this.contentLine);
        this.lineCount++;

        // schedule next line
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
        $('body').on('click', 'a[href^="#"]', function (e) {
          if(e.metaKey || e.altKey || e.ctrlKey){
            // just let browser's default key-specific behaviour kick-in
            return;
          }

          e.preventDefault();
          that.navigate($(this).attr('href'), {trigger: true});
        });
      }
    },

    home: function(){
      scope.showPage('shortnotion');
      scope.loadShortcuts();
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

    // because this is a single page app, we'll manually send a pageview
    // to google analytics every time a new 'page' is shown
    ga('set', 'page', '/'+window.location['hash']);
    ga('send', 'pageview');
  };

  scope.loadShortcutFromImageElement = function(img_el, page_id){
      // create link element
      var link_el = jQuery('<a class="shortcut" href="#page/'+page_id+'">');
      // add image to link element
      link_el.append(img_el);
      // add link element to page
      $('div.page').append(link_el);

      // when the image is loaded, calculate its height
      // (with all the page's css styling) applied to it
      // and vertically apply random margin
      img_el.on('load', function(event){
        // console.log('image size: ', this.width, this.height);
        var overflow = this.height - link_el.height();
        var margin = Math.floor(Math.random() * overflow);
        img_el.css({'margin-top': -margin+'px'});
      });
  };

  scope.loadShortcutFromVideoElement = function(el, page_id, options){
      // create link element
      var link_el = jQuery('<a class="shortcut" href="#page/'+page_id+'">');

      // customize; no small classes, only regular size
      el.removeClass('small');
      // don't show controls
      if(options.youtube)
        el.prop('src', el.prop('src') + '&showinfo=0&disablekb=1&controls=0');
      // add image to link element
      link_el.append('<span class="overlay">&nbsp;</span>');
      link_el.append(el);
      // add link element to page
      $('div.page').append(link_el);
      

      // no that the element is added to the page and all css styling is appliead
      // calculate vertical overflow and apply random vertical margin
      var overflow = el.height() - link_el.height();
      var margin = Math.floor(Math.random() * overflow);
      el.css({'margin-top': -margin+'px'});

      // el.on('load', function(event){
      //   console.log('loaded!', event.target);
      // });
  };

  scope.loadShortcuts = function(){
    var imgs = $('body template.page').each(function(idx, page_el){
      // create temporary div to hold the current template's content
      // (jQuery doesn't support searching inside template elements' bodies)
      var tmpdiv = jQuery('<div></div>');
      // move template's content into temporary div
      tmpdiv.html(jQuery(page_el).html());
      // find image elements
      var els = tmpdiv.find('img');
      // if we found any images
      if(els.length > 0){
        // pick a random image
        var el = jQuery(els[Math.floor(Math.random()*els.length)]);
        // create a shortcut from it
        scope.loadShortcutFromImageElement(el, page_el.id);
        // done
        return;
      }

      // try youtube iframe elements instead of image elements
      /*els = tmpdiv.find('iframe.youtube');
      if(els.length > 0){
        // pick a random iframe element
        var el = jQuery(els[Math.floor(Math.random()*els.length)]);
        scope.loadShortcutFromVideoElement(els, page_el.id, {youtube: true});
        return;
      }*/

      // try vimeo iframe elements instead of image elements
      els = tmpdiv.find('iframe.vimeo');
      if(els.length > 0){
        // pick a random iframe element
        var el = jQuery(els[Math.floor(Math.random()*els.length)]);
        scope.loadShortcutFromVideoElement(el, page_el.id, {youtube: false});
        return;
      }
    });
  };

  // register keydown-handler
  $(window).on('keydown', function(event){
    // for debugging; press the slash key to toggle between styling versions
    if(event.key == '/'){
      // console.log('toggle version2');
      $('#menu').toggleClass('version2');
    }
  });

  $(window).on('resize', function(event){
    if(scope.backdropper){
      // in case the window got bigger; this will fill the background with more content,
      // otherwise, nothing will happen
      scope.backdropper.addLine();
    }
  });

  $('div.page').on('click', '#showall', function(event){
    event.preventDefault();
    event.stopPropagation();
    $('.page.backseatsessions #episodes').html($('template#backseatsessions-episodes').html());
    $(this).hide();
  });

  // initialize instance of our router and start monitoring for address (anchor) changes
  scope.router = new scope.MarkRouter();
  // console.log('Backbone.history.start');
  Backbone.history.start({pushState: Backbone.history._hasPushState});

  // store scope for global (window-wide) reference
  window.shortnotionjs = scope;
});