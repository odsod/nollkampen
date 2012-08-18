var socket = io.connect('http://localhost');

(function ($) {

  $(function () {

    // Register all templates as partials
    Handlebars.partials = Handlebars.templates;

    socket.on('clear', function (data) {
      $('body')
        .empty();
    });

    socket.on('scoreboard', function (data) {
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
  });
}(jQuery));
