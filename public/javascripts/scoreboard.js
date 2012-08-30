(function ($) {

  var NAMESPACE = 'scoreboard'
    , DEFAULTS = {
      blinkTime: 2000
    , fadeTime: 1500
    , scrollTime: 2000
    , scrollEasing: 'linear'
    , fadeEasing: 'linear'
    , fontScales: {
        header: 0.50
      , result: 0.56
      , highlight: 0.70
      }
    };

  function init(options) {
    return this.each(function () {
      var settings       = $.extend(DEFAULTS, options)
        , $scoreboard    = $(this)
        , $header        = $('.sb-header', $scoreboard)
        , $content       = $('.sb-content', $scoreboard)
        , $headerTexts   = $('.sb-text', $header)
        , $resultsView   = $('.sb-results-container', $content)
        , $adsView       = $('.sb-ads-container', $scoreboard)
        , $resultRows    = $('.sb-result-row', $resultsView)
        , $resultRow     = $resultRows.first()
        , $blankRow      = $resultRow.prev()
        , $resultTexts   = $('.sb-result-col', $resultRows)
        , $scores        = $('.sb-score', $resultRows)
        , $times         = $('.sb-time', $resultRows)
        , $highlights    = $('.sb-hilight', $resultRows)
        , itemsPerScreen = Math.floor($resultsView.height() /
          ($resultRow.height() + $blankRow.height()))
        , lastResultPivot = $resultRows.length - itemsPerScreen
        , $resultPivots = $resultRows.filter(function (i) {
          return i === lastResultPivot ||
                 i < lastResultPivot && i % itemsPerScreen === 0;
        })
        , $blankPivots = $resultPivots.prev();

      // Bind automatical resize listeners
      $(window).bind('resize.' + NAMESPACE, function () {
        $headerTexts.css({
          'font-size': $headerTexts.first().height() * settings.fontScales.header
        });
        $resultTexts.css({
          'font-size': $resultRows.first().height() * settings.fontScales.result
        });
        $highlights.css({
          'font-size': $resultRows.first().height() * settings.fontScales.highlight
        });
      }).trigger('resize.' + NAMESPACE);

      $times.hide();
      var currPivot = 0;

      function rotateResults() {
        // Use the scoreboard animation queue
        $scoreboard

          // Hide scores
          .queue(function () {
            var $this = $(this);
            $scores
              .delay(settings.blinkTime)
              .fadeOut(settings.fadeTime, _.once(function () {
                $this.dequeue();
              }));
          })

          // Blink times
          .queue(function () {
            var $this = $(this);
            $times
              .fadeIn(settings.fadeTime)
              .delay(settings.blinkTime)
              .fadeOut(settings.fadeTime, _.once(function () {
                $this.dequeue();
              }));
          })

          // Show scores
          .queue(function () {
            var $this = $(this);
            $scores
              .fadeIn(settings.fadeTime, _.once(function () {
                $this.dequeue();
              }));
          })

          // Scroll to next screen
          .queue(function () {
            var $this = $(this);
            currPivot = (currPivot + 1) % $blankPivots.length;
            var $pivot = $blankPivots.eq(currPivot);
            $resultsView.animate({
              'scrollTop': $pivot.offset().top -
                           $resultsView.offset().top +
                           $resultsView.scrollTop() + 4
            }, {
              duration: settings.scrollTime
            , easing: settings.scrollEasing
            , complete: _.once(function () {
                $this.dequeue();
                // Repeat from the top
                rotateResults();
              })
            });
          });
      }

      // Start the animation loop
      rotateResults();
    });
  }

  function destroy() {
    return this.each(function () {
      // Unbind all scoreboard listeners
      $(window).unbind('.' + NAMESPACE);
      // Clear the animation queue
      $(this).clearQueue();
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
