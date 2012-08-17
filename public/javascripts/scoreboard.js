(function ($) {

  $.fn.autoRotateChildren = function (options) {
      var defaults = {
        interval: 3000,
        crossfade: 0
      };
      options = $.extend(defaults, options);
      var rotations = [];
      // rotations[i] = jQuery collection of children to show in rotation #i
      for (var i = 0, $children = $(":eq("+i+")", this);
         $children.length > 0;
         $children = $(":eq("+(++i)+")", this)) {
        rotations[i] = $children;
        // All children start out as hidden
        rotations[i].hide();
      }
      var currRotation = 0;
      rotations[currRotation].show();
      setInterval(function () {
        rotations[currRotation].hide();
        currRotation = (currRotation + 1) % rotations.length;
        rotations[currRotation].show();
      }, options.interval);
    };


  $.fn.scrollTo = function (target, callback) {
      var defaults = {
        target: $(),
        scrollTime: 2000
      };
      $.extend(defaults, options);
      console.log('scrolling to' + target.offset().top)
      this.animate({
        "scrollTop": target.offset().top
               - this.offset().top
               + this.scrollTop()
      }, 3000, callback);
    };

  var 
    namespace = 'scoreboard',
    defaults = {
      itemsPerScreen: 5
    },
    methods = {
      init: function (options) {
        var 
          settings = $.extend(defaults, options);
          lastPivotIndex = this.length - settings.itemsPerScreen;
          $pivotElements = this.filter(function (i) {
            if (i >= lastPivotIndex) return i === lastPivotIndex;
            else return i % settings.itemsPerScreen === 0;
          });
          $pivotElements = $pivotElements.prev();
          console.log(this.first().parent());
          var $view = this.first().parent();
          var i = 0;
          function scrollIt() {
            i = (i + 1) % $pivotElements.length;
            console.log($pivotElements.eq(i));
            $view
              .delay(4000)
              .scrollTo($pivotElements.eq(i), function () {
                scrollIt();
              })
          }
          scrollIt();
          $('.sb-result', this).autoRotateChildren();
      },
      destroy: function () {
      }
    };

  $.fn.scoreboard = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method' + method + 'does not exist on jQuery.countDown');
    }
  };

}(jQuery));
