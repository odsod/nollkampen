(function ($) {

  var utils = window.nollkampenUtils = window.nollkampenUtils || {};

  utils.bindFontFitOnResize = function (map) {
    $(window).bind('resize', function () {
      $.each(map, function (i, param) {
        param.$el.css({
          'font-size': param.$el.height() * param.scale
        });
      });
    }).trigger('resize');
  };

}(jQuery));
