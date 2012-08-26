var socket = io.connect('http://localhost');

(function ($) {

  // Register all templates as partials
  Handlebars.partials = Handlebars.templates;

  var $activePane;
  var $body;

  $(function () {
    $body = $('body').empty();
    $activePane = $('<div class="active pane">');
    $activePane.appendTo($body);
  });

  socket.on('clear', function (data) {
    $(window).trigger('clear');
    $body.empty();
  });

  socket.on('scoreboard', function (data) {
    console.log(data);
    // Clear everything
    $(window).trigger('clear');
    // Insert html
    $('body')
      .empty()
      .html(Handlebars.templates.scoreboard(data));
    // Apply plugin
    $('.sb').scoreboard();
    // Register cleanup
    $(window).bind('clear.scoreboard', function () {
      // Remove plugin
      $('.sb').scoreboard('destroy').remove();
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
