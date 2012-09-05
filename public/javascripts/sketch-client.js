(function ($) {

  var namespace = 'sketch'
    , defaults = {
      test: 5
    };

  function init(options) {
    return this.each(function () {
      var settings = $.extend(defaults, options)
        , $sketch = $(this)
        , $canvas = $('canvas', $sketch)
        , $image = $('img', $sketch);

      $canvas[0].width = window.innerWidth;
      $canvas[0].height = window.innerHeight;

      // Draw in case already in cache
      $canvas.drawImage({
          source: $image.attr('src')
        , x: 0
        , y: 0
        , width: window.innerWidth
        , height: window.innerHeight
        , fromCenter: false
        });

      // If not in cache, draw when loaded
      $image.load(function () {
        $canvas.drawImage({
          source: $image.attr('src')
        , x: 0
        , y: 0
        , width: window.innerWidth
        , height: window.innerHeight
        , fromCenter: false
        });
      });
    });
  }

  function stroke(data) {
    return this.each(function () {
      var $canvas = $(this).children('canvas');
      $canvas.drawEllipse({
        fillStyle: '#F00'
      , x: data.x1 * window.innerWidth
      , y: data.y1 * window.innerHeight
      , width: 15
      , height: 15
      });
    });
  }

  var methods = {
      init: init
    , stroke: stroke
    , destroy: function () {
        return this.each(function () {
        });
      }
    };

  $.fn[namespace] = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method' + method + 'does not exist on jQuery.' + namespace);
    }
  };

}(jQuery));
