var socket = io.connect('http://nollkampen');

(function ($) {

  var $body;
  var $background;
  var bottomZ;
  var nextZ;

  $(function () {
    // Register all templates as partials
    Handlebars.partials = Handlebars.templates;
    // Cache body
    $body = $('body');
    // Create background
    $background = $('<div class="background pane">');
    // Insert background pane
    $background.appendTo($body);
    // Init Z-index
    bottomZ = 0;
    nextZ = bottomZ + 1;
  });

  function clearScreen(callback) {
    var $plugins = $('.plugin');
    if ($plugins.length > 0) {
      $plugins
        .stop(true)
        .fadeOut(2000, _.once(function () {
          $('window').trigger('clear');
          $('*').unbind();
          $plugins.remove();
          nextZ = bottomZ + 1;
          if (callback) {
            callback();
          }
        }));
    } else {
      callback();
    }
  }

  function swapContent($element, plugin) {
    // Start by clearing screen
    clearScreen(function () {
      $element
        .css('z-index', bottomZ - 1)
        .appendTo($body);
      if (plugin) {
        $element[plugin]();
      }
      $background.fadeOut(2000, function () {
        $element.css('z-index', nextZ);
        nextZ += 1;
        $background.show();
        if (plugin) {
          $(window).bind('clear.' + plugin, function () {
            $element[plugin]('destroy').remove();
          });
        }
      });
    });
  }

  function addContent($element, plugin, fadeIn) {
    $element
      .hide()
      .css('z-index', nextZ)
      .appendTo($body);
    nextZ += 1;
    if (fadeIn) {
      $element.fadeIn(2000, function () {
        if (plugin) {
          $element[plugin]();
          $(window).bind('clear.' + plugin, function () {
            $element[plugin]('destroy');
          });
        }
      });
    } else {
      $element.show();
      if (plugin) {
        $element[plugin]();
        $(window).bind('clear', function () {
          $element[plugin]('destroy').remove();
        });
      } else {
        $(window).bind('clear', function () {
          $element.remove();
        });
      }
    }
  }

  function throwdown(data) {
    $(window).trigger('clear.throwdown');
    var $throw = $(Handlebars.templates.throwdown(data));
    addContent($throw, 'throwdown');
    // On throwdown clear, keep only the 5 latest throwdowns
    $(window).unbind('clear.throwdown');
    $(window).bind('clear.throwdown', function () {
      var $throwdowns = $('.throwdown');
      if ($throwdowns.length > 5) {
        $throwdowns.first().throwdown('destroy').remove();
      }
    });
  }

  socket.on('clear', function (data) {
    clearScreen();
  });

  socket.on('scoreboard', function (data) {
    var $scoreboard = $(Handlebars.templates.scoreboard(data));
    swapContent($scoreboard, 'scoreboard');
  });

  socket.on('slideshow', function (data) {
    console.log('slideshow');
    var $slideshow = $(Handlebars.templates.slideshow(data));
    swapContent($slideshow, 'slideshow');
  });

  socket.on('revealCompetition', function (data) {
    var $reveal = $(Handlebars.templates['reveal-competition'](data));
    swapContent($reveal, 'reveal');
  });

  socket.on('revealTotal', function (data) {
    var $reveal = $(Handlebars.templates['reveal-total'](data));
    swapContent($reveal, 'reveal');
  });

  socket.on('revealNext', function () {
    $('.reveal.plugin').reveal('next');
  });

  socket.on('throwdown', throwdown);

  socket.on('countdown', function (data) {
    $(window).trigger('clear.countdown');
    var $count = $(Handlebars.templates.countdown(data));
    addContent($count, 'countdown', false);
    $(window).unbind('clear.countdown');
    $(window).bind('clear.countdown', function () {
      $count.countdown('destroy').remove();
    });
  });

  socket.on('megaCountdown', function (data) {
    $(window).trigger('clear.megaCountdown');
    var $count = $(Handlebars.templates['mega-countdown'](data));
    addContent($count, 'megaCountdown', false);
  });

  socket.on('textmessage', function (data) {
    var $msg = $(Handlebars.templates.textmessage(data));
    addContent($msg, null, true);
  });

  socket.on('fullscreenPicture', function (data) {
    clearScreen(function () {
      var $pic = $(Handlebars.templates['fullscreen-picture'](data));
      addContent($pic, null, true);
    });
  });

  socket.on('autoThrowdown', function (data) {

    var i = 0;
    function doThrowdown() {
      if (i < data.throwdowns.length) {
        throwdown(data.throwdowns[i]);
        i += 1;
        setTimeout(doThrowdown, data.interval);
      }
    }

  });

  socket.on('sketch', function (data) {
    var $sketch = $(Handlebars.templates.sketch(data));
    swapContent($sketch, 'sketch');
  });

  socket.on('sketchstroke', function (data) {
    var $sketch = $('.sketch');
    $sketch.sketch('stroke', data);
  });

}(jQuery));
