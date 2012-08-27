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
      .fadeOut(_.once(function () {
        $('window').trigger('clear');
        $('*').unbind();
        $plugins.remove();
        nextZ = bottomZ + 1;
        if (callback) {
          callback();
        }
      }));
  }

  socket.on('clear', function (data) {
    clearScreen();
  });

  socket.on('scoreboard', function (data) {
    console.log('scoreboard');
    // Start by clearing screen
    clearScreen(function () {
      // Render html
      var $scoreboard = $(Handlebars.templates.scoreboard(data));
      // Insert behind background and initialize
      $scoreboard
        .css('z-index', bottomZ - 1)
        .appendTo($body)
        .scoreboard();
      $background.fadeOut(function () {
        $scoreboard.css('z-index', nextZ);
        nextZ += 1;
        $background.show();
      });
      $(window).bind('clear.scoreboard', function () {
        $scoreboard.scoreboard('destroy');
      });
    });
  });

  socket.on('revealCompetition', function (data) {
    $(window)
      .trigger('clear');
    // Insert html
    $('body')
      .append(Handlebars.templates['reveal-competition'](data));
    // Apply plugin
    $('.sb')
      .reveal();
    // Register cleanup
    $(window)
      .bind('clear.reveal', function () {
        $('.sb')
          .reveal('destroy')
          .remove();
      });
  });

  socket.on('revealTotal', function (data) {
    console.log(data);
    $(window)
      .trigger('clear');
    // Insert html
    $('body')
      .append(Handlebars.templates.scoreboard(data));
    // Apply plugin
    $('.sb')
      .reveal();
    // Register cleanup
    $(window)
      .bind('clear.reveal', function () {
        $('.sb')
          .reveal('destroy')
          .remove();
      });
  });

  socket.on('revealNext', function () {
    console.log('next');
    // Reveal next
    $('.sb')
      .reveal('next');
  });

  socket.on('throwdown', function (data) {
    $(window)
      .trigger('clear');
    // Insert html
    $('body')
      .append(Handlebars.templates.throwdown(data));
    $('.throwdown')
      .throwdown();
    // Register cleanup
    $(window)
      .bind('clear.throwdown', function () {
        $('.throwdown')
          .throwdown('destroy')
          .remove();
      });
  });

  socket.on('countdown', function (data) {
    // Clear any previous countdown
    $(window)
      .trigger('clear.countdown');
    // Insert html
    $('body')
      .append(Handlebars.templates.countdown(data));
    // Apply plugin
    $('.countdown')
      .countdown();
    // Register cleanup
    $(window)
      .bind('clear.countdown', function () {
        $('.cd').countdown('destroy').remove();
      });
  });

}(jQuery));
