(function ($) {

  var 

    namespace = 'countdown',

    defaults = {
      message: '',
      seconds: 10,
      expandEasing: 'easeOutCirc',
      shrinkEasing: 'easeInExpo',
      expandDuration: 200,
      shrinkDuration: 1500,
      complete: function () {}
    },

    methods = {

      init: function (options) {
        console.log('found init');
        console.log(this);
        return this.each(function () {
          console.log('initing');
          var 
            $this = $(this),
            data = $this.data(namespace);
          if (!data) {
            console.log('initializing');
            var
              settings = $.extend(defaults, options),
              $numberContainer = $('.cd-number', $this),
              originalFontSize = $numberContainer.css('font-size');
            $this.data(namespace, {
              count: settings.seconds,
              originalFontSize: originalFontSize,
              settings: settings
            });
            methods.nextCount.call($this);
          }
        });
      },

      nextCount: function () {
        var 
          data = this.data(namespace),
          $numberContainer = $('.cd-number', this);
        if (data.count > 0) {
          console.log('counting');
          $numberContainer
            .text(data.count)
            .css('font-size', 0)
            .show(); 
          data.count -= 1;
          $numberContainer
            .delay(200)
            .animate({
              'font-size': data.originalFontSize
            }, {
              duration: 700,
              easing: data.settings.expandEasing
            })
            .delay(200)
            .fadeOut(500, $.proxy(methods.nextCount, this));
            // .animate({ 
            //   'font-size': 0
            // }, {
            //   duration: data.settings.shrinkDuration,
            //   easing: data.settings.shrinkEasing,
            //   complete: $.proxy(methods.nextCount, this)
            // });
        } else {
          data.settings.complete.call(this);
        }
      },

      destroy: function () {
        return this.each(function () {
          var 
            $this = $(this),
            data = $this.data(namespace);
          $this.stop(true);
          $this.css('font-size', data.originalFontSize);
          $this.text('');
          $this.removeData(namespace);
        });
      }

    };

  $.fn.countdown = function (method) {
    console.log('countdown');
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      console.log('init going');
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method' + method + 'does not exist on jQuery.' + namespace);
    }
  };

}(jQuery));
