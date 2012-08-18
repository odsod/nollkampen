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

  // $.fn.autoRotateChildren = function (options) {
  //     var defaults = {
  //       interval: 3000,
  //       crossfade: 0
  //     };
  //     options = $.extend(defaults, options);
  //     var rotations = [];
  //     // rotations[i] = jQuery collection of children to show in rotation #i
  //     for (var i = 0, $children = $(":eq("+i+")", this);
  //        $children.length > 0;
  //        $children = $(":eq("+(++i)+")", this)) {
  //       rotations[i] = $children;
  //       // All children start out as hidden
  //       rotations[i].hide();
  //     }
  //     var currRotation = 0;
  //     rotations[currRotation].show();
  //     setInterval(function () {
  //       rotations[currRotation].hide();
  //       currRotation = (currRotation + 1) % rotations.length;
  //       rotations[currRotation].show();
  //     }, options.interval);
  //   };


  // $.fn.scrollTo = function (target, callback) {
  //     var defaults = {
  //       target: $(),
  //       scrollTime: 2000
  //     };
  //     $.extend(defaults, options);
  //     console.log('scrolling to' + target.offset().top)
  //     this.animate({
  //       "scrollTop": target.offset().top
  //              - this.offset().top
  //              + this.scrollTop()
  //     }, 3000, callback);
  //   };

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
          console.log($resultPivots);
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
          console.log($times);
          console.log($scores);
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

          function rotateAds() {
            // Show ads
            // Rotate to next
          }
          rotateResults();
          rotateAds();
        });
      },

      destroy: function () {
        $(window).unbind('resize.' + namespace);
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
