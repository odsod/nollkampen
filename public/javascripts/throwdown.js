(function ($) {

  var namespace = 'throwdown'
    , defaults = {
      test: 5
    };

  function init(options) {
    return this.each(function () {
      var settings = $.extend(defaults, options)
        , $throwdown = $(this)
        , $pic = $('.td-picture', $throwdown)
        , $img = $('img', $pic)
        , $cap = $('p', $pic)
        , $parent = $throwdown.parent()
        , midX = $parent.width() / 2
        , midY = $parent.height() / 2
        , rangeX = $parent.width() * 0.30
        , rangeY = $parent.height() * 0.01;
      $pic.hide();
      $img.load(function () {
        var w = $pic.width()
          , h = $pic.height()
          , x = (rangeX * Math.random()) - (rangeX / 2) + midX - w / 2
          , y = (rangeY * Math.random()) - (rangeY * 4) + midY - h / 2
          , rot = (20 * Math.random()) - 10
          , displaceX = (Math.random() * 4 * $parent.width()) - 2 * $parent.width() - x;
        $pic
          .css({
            'left': x
          , 'top': y
          })
          .css({
            'x': (displaceX > 0 ? '-=' : '+=') + Math.abs(displaceX)
          , 'y': '+=' + 1.7 * $parent.height()
          , 'rotate': ((Math.random() * 180) - 90) + 'deg'
          , 'scale': 2.5
          })
          .show()
          .transition({
            'x': (displaceX > 0 ? '+=' : '-=') + Math.abs(displaceX)
          , 'y': '-=' + 1.7 * $parent.height()
          , 'rotate': rot
          , 'scale': 1
          }, 1000, 'snap');
      });
    });
  }

  var methods = {
      init: init,
      destroy: function () {
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
