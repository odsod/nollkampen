(function ($) {

  var NAMESPACE = 'megaCountdown'
    , DEFAULTS = {
      seconds: 10
    , inEasing: 'easeOutCirc'
    , outEasing: 'linear'
    };

  function init(options) {
    return this.each(function () {
      var settings = $.extend(DEFAULTS, options)
        , $countdown = $(this)
        , $count = $('.cd-count', $countdown)
        , currCount = settings.seconds;

      function nextTick() {

        // Break loop when count is 0
        if (currCount <= 0) {
          return;
        }

        $count
          .css('font-size', 0)
          .show()
          .text(currCount)
          .delay(200)
          .animate({
            'font-size': $countdown.parent().height() / 2
          }, {
            duration: 800,
            easing: settings.inEasing
          })
          .delay(200)
          // TODO: check api and apply easing
          .fadeOut(400, nextTick);

        currCount -= 1;
      }

      // Start loop
      nextTick();

    });
  }

  function destroy() {
    return this.each(function () {
      $(this)
        .clearQueue()
        .text('');
    });
  }

  var methods = {
      init: init
    , destroy: destroy
    };

  $.fn[NAMESPACE] = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method' + method + 'does not exist on jQuery.' + NAMESPACE);
    }
  };

}(jQuery));
