(function ($) {

  var NAMESPACE = 'countdown'
    , DEFAULTS = {
      message: 'Nollkampen börjar om: '
    , seconds: 15
    , fullScreenStopTime: 10
    , fontScale: 0.5
    , formatter: function (count) {
        if (count > 3600) {
          return Math.ceil(count / 3600) + ' timmar';
        } else if (count > 60) {
          return Math.ceil(count / 60) + ' minuter';
        } else if (count > 10) {
          return count + ' sekunder';
        } else {
          return count;
        }
      }
    };

  function init(options) {
    return this.each(function () {

      var settings = $.extend(DEFAULTS, options)
        , $countdown = $(this)
        , $count = $('.cd-count', $countdown)
        , currCount = settings.seconds;

      $countdown.css('font-size', $countdown.height() * settings.fontScale);

      // TODO: move this to stylesheet
      $count.css({
        'padding-left':  20
      , 'padding-right': 20
      });
      $count.hide();

      function goFullScreen() {
        $countdown
          // Fade out count
          .queue(function () {
            var $this = $(this);
            // Maintain size after text is gone
            $countdown.css('width', $countdown.width());
            // Fade out text
            $count.fadeOut(300, _.once(function () {
              // Prepare styles for first animation
              $count
                .text('')
                .css('font-size', 0)
                .show();
              $this.dequeue();
            }));
          })
          .animate({
            'width':  $countdown.parent().width()
          , 'height': $countdown.parent().height()
          }, {
            duration: 5000
          })
          .animate({
            'opacity': 1
          , 'border-radius': 0
          }, {
            duration: 2000
          , complete: nextTick
          });
      }

      function nextTick() {
        if (currCount < 1) {
          return;
        }
        if (currCount > 10) {
          $count.text(settings.message + settings.formatter(currCount));
          currCount -= 1;
          if (settings.fullScreenStopTime && currCount === settings.fullScreenStopTime) {
            setTimeout(goFullScreen, 1000);
          } else {
            setTimeout(nextTick, 1000);
          }
        } else {
          // Let the rest be handled by starting a full screen countdown
          return;
        }
      }

      function bootstrap() {
        if (currCount <= 10) {
          goFullScreen();
        } else {
          $count.text(settings.message + settings.formatter(currCount));
          $count.fadeIn(1000, nextTick);
        }
      }

      // Bootstrap and go!
      bootstrap();
    });
  }

  function destroy() {
    return this.each(function () {
      $(this)
        // Break count loop
        .stop(true);
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
