var socket = io.connect('http://localhost');

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
    // Insert dummy plugin for debug
    $body.append('<div class="dummy plugin"></div>');
    // Init Z-index
    bottomZ = 0;
    nextZ = bottomZ + 1;
  });

  function clearScreen(callback) {
    var $plugins = $('.plugin');
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
  }

  function swapContent($element, plugin) {
    // Start by clearing screen
    clearScreen(function () {
      $element
        .css('z-index', bottomZ - 1)
        .appendTo($body);
      $element[plugin]();
      $background.fadeOut(2000, function () {
        $element.css('z-index', nextZ);
        nextZ += 1;
        $background.show();
        $(window).bind('clear.scoreboard', function () {
          $element[plugin]('destroy');
        });
      });
    });
  }

  function addContent($element, plugin) {
  
  }

  socket.on('clear', function (data) {
    clearScreen();
  });

  socket.on('scoreboard', function (data) {
    var $scoreboard = $(Handlebars.templates.scoreboard(data));
    swapContent($scoreboard, 'scoreboard');
  });

  socket.on('revealCompetition', function (data) {
    console.log('reveal competition');
    console.log(data);
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

  socket.on('throwdown', function (data) {
    var $throw = Handlebars.templates.throwdown(data);
    addContent($throw, 'throwdown');
  });

  socket.on('countdown', function (data) {
    var $count = Handlebars.templates.countdown(data);
    addContent($count, 'countdown');
  });

}(jQuery));
