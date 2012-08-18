(function ($) {

  function awaitAnimations(n, callback) {
    var 
      i = 0,
      animationCallback = function () {
        i += 1;
        if (i === n) {
          callback();
        }
      }
    return animationCallback;
  };

  var 
    namespace = 'scoreboard',
    defaults = {
    },
    methods = {

      init: function (options) {
        return this.each(function () {
          var
            settings = $.extend(defaults, options),
            $scoreboard = $(this),
            $header = $('.sb-header', $scoreboard),
            $content = $('.sb-content', $scoreboard),
            $headerTexts = $('.sb-text', $header),
            $resultsView = $('.sb-results-container', $content),
            $adsView = $('.sb-ads-container', $scoreboard),
            $resultRows = $('.sb-result-row', $resultsView),
            $resultRow = $resultRows.first(),
            $blankRow = $resultRow.prev(),
            $resultTexts = $('.sb-result-col', $resultRows),
            $scores = $('.sb-score', $resultRows),
            $times = $('.sb-time', $resultRows),
            $highlights = $('.sb-hilight', $resultRows),
            itemsPerScreen = Math.floor(
              $resultsView.height() / ($resultRow.height() + $blankRow.height())
            ), 
            lastResultPivot = $resultRows.length - itemsPerScreen,
            $resultPivots = $resultRows.filter(function (i) {
              return i === lastResultPivot || 
                     i < lastResultPivot && i % itemsPerScreen === 0;
            }),
            $blankPivots = $resultPivots.prev();
          $(window).bind('resize.' + namespace, function () {
            $headerTexts.css({
              'font-size': $headerTexts.first().height() * 0.4
            });
            $resultTexts.css({
              'font-size': $resultRows.first().height() * 0.45
            });
            $highlights.css({
              'font-size': $resultRows.first().height() * 0.40,
              'padding': '0.2em' 
            });
          }).trigger('resize.' + namespace);          

          $times.hide();
          var next = $.proxy($scoreboard.dequeue, $scoreboard);
          var currPivot = 0;

          function rotateResults() {
            $scoreboard
              // Showing scores
              .delay(2000)
              // Hide scores
              .queue(function() {
                var callback = awaitAnimations(1, next);
                $scores.fadeOut(1000, callback);
              }).delay(200)
              // Show times
              .queue(function() {
                var callback = awaitAnimations(1, next);
                $times.fadeIn(1000, callback);
              }).delay(2000)
              // Hide times
              .queue(function () {
                var callback = awaitAnimations(1, next);
                $times.fadeOut(1000, callback);
              }).delay(200)
              // Show scores
              .queue(function () {
                var callback = awaitAnimations(1, next);
                $scores.fadeIn(1000, callback);
              }).delay(2000)
              // Scroll to next screen
              .queue(function () {
                currPivot = (currPivot + 1) % $blankPivots.length;
                var $pivot = $blankPivots.eq(currPivot);
                var callback = awaitAnimations(1, next);
                $resultsView.animate({
                  "scrollTop": $pivot.offset().top
                         - $resultsView.offset().top
                         + $resultsView.scrollTop()
                }, 3000, callback);
              })
              .queue(function () {
                next();
                rotateResults();
              });
          }
          rotateResults();
        });
      },

      destroy: function () {
        return this.each(function () {
          // Unbind resize listeners
          $(window).unbind('resize.' + namespace);
          // Clear the scrolling queue
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
