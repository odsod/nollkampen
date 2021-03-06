(function ($) {

  var NAMESPACE = 'reveal'
    , DEFAULTS = {
      fontScales: {
        header: 0.5
      , result: 0.7
      , highlight: 0.7
      }
    , easing: 'easeOutCubic'
    };

  function moveOut($elements) {
    var $lastElement = $elements.last();
    $elements.css({
      'position': 'relative',
      'top': - $lastElement.offset().top - $lastElement.height()
    });
  }

  function init(options) {
    return this.each(function () {
      var settings = $.extend(DEFAULTS, options)
        , $scoreboard = $(this)
        , $header = $('.sb-header', $scoreboard)
        , $content = $('.sb-content', $scoreboard)
        , $headerTexts = $('.sb-text', $header)
        , $resultsView = $('.sb-results-container', $content)
        , $adsView = $('.sb-ads-container', $scoreboard)
        , $resultRows = $('.sb-result-row', $resultsView)
        , $resultRow = $resultRows.first()
        , $blankRow = $resultRow.prev()
        , $resultTexts = $('.sb-result-col, .sb-time-col, .sb-score-col', $resultRows)
        , $scores = $('.sb-score', $resultRows)
        , $times = $('.sb-time', $resultRows)
        , $highlights = $('.sb-hilight', $resultRows)
        , $ones = $('.sb-place-col:contains(1)', $resultRows).parent()
        , $twos = $('.sb-place-col:contains(2)', $resultRows).parent()
        , $threes = $('.sb-place-col:contains(3)', $resultRows).parent();

      // Fit fonts
      window.nollkampenUtils.bindFontFitOnResize([
        { $el: $headerTexts, scale: settings.fontScales.header }
      , { $el: $resultTexts, scale: settings.fontScales.result }
      , { $el: $highlights, scale: settings.fontScales.highlight }
      ]);

      // Only show scores, no times
      $('.sb-time', $resultRows).hide();

      // Move result rows out of screen
      moveOut($ones);
      moveOut($twos);
      moveOut($threes);

      // Hide all results >= position 3
      $threes.last().nextAll().hide();

      // Save reveal progression in the DOM
      $(this).data(NAMESPACE, {
        next: [$ones, $twos, $threes]
      });
    });
  }

  function next() {
    return this.each(function () {
      var data = $(this).data(NAMESPACE);
      if (data.next.length > 0) {
        data.next.pop()
          .animate({
            'top': 0
          // TODO: move easing to .data()
          }, 3000, 'easeOutCubic');
      }
    });
  }

  function destroy() {
    return this.each(function () {
      // Unbind resize listeners
      $(window).unbind('resize.' + NAMESPACE);
    });
  }

  var methods = {
      init: init,
      next: next,
      destroy: destroy
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
