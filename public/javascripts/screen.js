var socket = io.connect('http://localhost');


(function ($) {

	$.fn.autoStretchFont = function (options) {
		var defaults = {
			ratio: 0.5
		};
		options = $.extend(defaults, options);
		var $self = this;
		$(window).bind('resize', function () {
			$self.css({
				"font-size": $self.height()*options.ratio+"px"
			});
		})
		$(window).trigger("resize");
	};

  $(function () {

    // Register all templates as partials
    Handlebars.partials = Handlebars.templates;

    socket.on('clear', function (data) {
      $('body')
        .empty();
    });

    socket.on('scoreboard', function (data) {
      console.log(Handlebars.templates.scoreboard(data));
      $('body')
        .empty()
        .html(Handlebars.templates.scoreboard(data));
      $('.sb-header-row .sb-cell')
        .autoStretchFont({
          ratio: 0.45
        });
      $('.sb-content-row .sb-cell')
        .autoStretchFont({
          ratio: 0.4
        });
    });

  });
}(jQuery));
