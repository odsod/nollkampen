(function ($) {

  function init(options) {
    return this.each(function () {
      var settings = $.extend({}, options)
        , $scoreboard = $(this)
        , $header = $('.sb-header', $scoreboard)
        , $content = $('.sb-content', $scoreboard)
        , $headerTexts = $('.sb-text', $header)
        , $resultsView = $('.sb-results-container', $content)
        , $adsView = $('.sb-ads-container', $scoreboard)
        , $resultRows = $('.sb-result-row', $resultsView)
        , $resultRow = $resultRows.first()
        , $blankRow = $resultRow.prev()
        , $resultTexts = $('.sb-result-col', $resultRows)
        , $scores = $('.sb-score', $resultRows)
        , $times = $('.sb-time', $resultRows)
        , $highlights = $('.sb-hilight', $resultRows)
        , itemsPerScreen = Math.floor($resultsView.height() /
          ($resultRow.height() + $blankRow.height()))
        , lastResultPivot = $resultRows.length - itemsPerScreen
        , $resultPivots = $resultRows.filter(function (i) {
          return i === lastResultPivot ||
                 i < lastResultPivot && i % itemsPerScreen === 0;
        })
        , $blankPivots = $resultPivots.prev();

      // Bind automatical resize listeners
      $(window).bind('resize.' + namespace, function () {
        $headerTexts.css({
          'font-size': $headerTexts.first().height() * 0.5
        });
        $resultTexts.css({
          'font-size': $resultRows.first().height() * 0.56
        });
        $highlights.css({
          'font-size': $resultRows.first().height() * 0.70
        });
      }).trigger('resize.' + namespace);

      $times.hide();
      var currPivot = 0;

      function rotateResults() {
        // Use the scoreboard animation queue
        $scoreboard
          // Hide scores
          .queue(function () {
            var $this = $(this);
            $scores
              .delay(1000)
              .fadeOut(1500, _.once(function () {
                $this.dequeue();
              }));
          })
          // Blink times
          .queue(function () {
            var $this = $(this);
            $times
              .fadeIn(1500)
              .delay(2000)
              .fadeOut(1500, _.once(function () {
                $this.dequeue();
              }));
          })
          // Show scores
          .queue(function () {
            var $this = $(this);
            $scores
              .fadeIn(1500, _.once(function () {
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
            }, 2000, _.once(function () {
              $this.dequeue();
              rotateResults();
            }));
          });
      }
      // Bootstrap the animation loop
      rotateResults();
    });
  }

  var namespace = 'scoreboard'
    , defaults = {}
    , methods = {
      init: init,

      destroy: function () {
        return this.each(function () {
          console.log('destroying scoreboard');
          // Unbind all scoreboard listeners
          $(window).unbind('.' + namespace);
          // Clear the animation queue
          $(this).clearQueue();
        });
      }
    };

  $.fn.scoreboard = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method' + method + 'does not exist on jQuery.' + namespace);
    }
  };

}(jQuery));
