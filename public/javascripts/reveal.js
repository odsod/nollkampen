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
    namespace = 'reveal',
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
            $resultTexts = $('.sb-time-col, .sb-score-col', $resultRows),
            $scores = $('.sb-score', $resultRows),
            $times = $('.sb-time', $resultRows),
            $highlights = $('.sb-hilight', $resultRows),
            $ones = $('.sb-place-col > span:contains(1)', $resultRows).parent().parent()
            $twos = $('.sb-place-col > span:contains(2)', $resultRows).parent().parent(),
            $threes = $('.sb-place-col > span:contains(3)', $resultRows).parent().parent();
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
          $('.sb-time', $resultRows).hide();
          $ones
            .css({
              'position': 'relative',
              'top': '-500px'
            });
          $twos
            .css({
              'position': 'relative',
              'top': '-500px'
            });
          $threes
            .css({
              'position': 'relative',
              'top': '-500px'
            });
          $(this).data(namespace, {
            next: [$ones, $twos, $threes]
          });
        });
      },

      next: function () {
        return this.each(function () {
          var data = $(this).data(namespace);
          if (data.next.length > 0) {
            data.next.pop()
              .animate({
                'top': 0
              }, 3000, "easeOutCubic");
          }
        });
      },

      destroy: function () {
        return this.each(function () {
          // Unbind resize listeners
          $(window).unbind('resize.' + namespace);
        });
      }
    };

  $.fn.reveal = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method' + method + 'does not exist on jQuery.' + namespace);
    }
  };

}(jQuery));
