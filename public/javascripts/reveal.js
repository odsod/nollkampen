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
        , $ones = $('.sb-place-col > span:contains(1)', $resultRows).parent().parent()
        , $twos = $('.sb-place-col > span:contains(2)', $resultRows).parent().parent()
        , $threes = $('.sb-place-col > span:contains(3)', $resultRows).parent().parent();

      $(window).bind('resize.' + NAMESPACE, function () {
        $headerTexts.css({
          'font-size': $headerTexts.first().height() * settings.fontScales.header
        });
        $resultTexts.css({
          'font-size': $resultRows.first().height() * settings.fontScales.result
        });
        $highlights.css({
          'font-size': $resultRows.first().height() * settings.fontScales.highlight
          // TODO: check if this can be moved to stylesheet
        , 'padding': '0.2em'
        });
      }).trigger('resize.' + NAMESPACE);

      $('.sb-time', $resultRows).hide();
      // TODO: check if jQuery.transit can be used for this
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
      // Hide all others
      $threes.last().nextAll().hide();
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
