(function ($) {

  var namespace = 'megaCountdown'
    , defaults = {
      seconds: 10
    };

  function init(options) {
    return this.each(function () {
      var settings = $.extend(defaults, options)
        , $countdown = $(this)
        , $count = $('.cd-count', $countdown)
        , currCount = settings.seconds;

      console.log('init mega-countdown');

      function nextTick() {
        if (currCount < 1) {
          return;
        }
        console.log('tick');
        $count
          .css('font-size', 0)
          .show()
          .text(currCount)
          .delay(200)
          .animate({
            'font-size': $countdown.parent().height() / 2
          }, {
            duration: 800,
            easing: 'easeOutCirc'
          })
          .delay(200)
          .fadeOut(400, nextTick);
        currCount -= 1;
      }

      // Bootstrap and go!
      nextTick();

    });
  }

  var methods = {
      init: init
    , destroy: function () {
        return this.each(function () {
          $(this)
            .clearQueue()
            .text('');
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
