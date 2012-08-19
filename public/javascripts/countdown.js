(function ($) {

  var 

    namespace = 'countdown',

    defaults = {
      message: '',
      seconds: 13,
      expandEasing: 'easeOutCirc',
      shrinkEasing: 'easeInExpo',
      expandDuration: 200,
      shrinkDuration: 1500,
      complete: function () {}
    },

    methods = {

      init: function (options) {
        return this.each(function () {
          var 
            settings = $.extend(defaults, options),
            $countdown = $(this),
            $count = $('.cd-count', $countdown),
            initialCount = (settings.seconds > 60 ?
                           Math.ceil(settings.seconds / 60) * 60 :
                           settings.seconds),
            currCount = initialCount,
            isFullscreen = false,
            next = $.proxy($countdown.dequeue, $countdown);

          $count.css({
            'font-size': $count.height() * 0.6
          });

          function nextCount() {
            if (currCount < 1) return;
            // Switch to fullscreen on last 10 seconds
            if (!isFullscreen && currCount <= 10) {
              $countdown
                // Fade small overlay out
                .fadeOut(1000)
                .delay(200)
                // Convert to big overlay
                .queue(function () {
                  $count
                    .text('');
                  $countdown
                    .css({
                      'padding': 0,
                      'height': '100%',
                      'width': '100%',
                      'opacity': 1
                    })
                    .dequeue();
                })
                // Fade back in
                .fadeIn(1000);
              isFullscreen = true;
            } 
            if (currCount <= 10) {
              $countdown
                // Set the text
                .queue(function () {
                  $count
                    .text(currCount)
                    .css('font-size', 0)
                    .show();
                  $countdown.dequeue();
                })
                .delay(200)
                // Expand the count
                .queue(function () {
                  $count
                    .animate({
                      'font-size': $count.height() / 2
                    }, {
                      duration: 700,
                      easing: 'easeOutCirc',
                      complete: function () {
                        $countdown.dequeue();
                      }
                    });
                })
                .delay(200)
                // Fade the count out
                .queue(function () {
                  $count.fadeOut(500, function () {
                    $countdown.dequeue();
                    currCount -= 1;
                    nextCount();
                  }); 
                });
            } else if (currCount <= 60) {
              $count.text('Nollkampen börjar om ' + currCount + ' sekunder...')
              currCount -= 1; 
              $countdown
                .delay(1000)
                .queue(function () {
                  $countdown.dequeue();
                  nextCount();
                });
            } else {
              $count.text('Nollkampen börjar om ' + Math.ceil(currCount / 60) + ' minuter...');
              currCount -= 60;
              $countdown
                .delay(60000)
                .queue(function () {
                  $countdown.dequeue();
                  nextCount();
                });
            }
          }
          nextCount();
        });
      },

      destroy: function () {
        return this.each(function () {
          $(this)
            .clearQueue()
            .text('');
        });
      }

    };

  $.fn.countdown = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method' + method + 'does not exist on jQuery.' + namespace);
    }
  };

}(jQuery));
