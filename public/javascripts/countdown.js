(function ($) {

  var 
    defaults = {
      countStart: 10,
      initialFontSize: 400
    },
    methods = {
      init: function (options) {
        return this.each(function () {
          var 
            $this = $(this),
            data = $this.data('countDown'),
            options = $.extend(defaults, options);
          if (!data) {
            $this.data('countDown', {
              count: options.countStart, 
              options: options
            });
            console.log($this.data('countDown'));
            methods.nextCount.call($this);
          }
        });
      },
      nextCount: function () {
        var data = this.data('countDown');
        if (data.count > 0) {
          this.text(data.count); 
          this.animate({
            'font-size': data.options.initialFontSize
          }, {
            duration: 200,
            easing: 'easeOutCirc',
            complete: $.proxy(function () {
              console.log(this);
              this.animate({ 
                'font-size': 0
              }, {
                duration: 1500,
                easing: 'easeInExpo',
                complete: $.proxy(methods.nextCount, this)
              });
              data.count -= 1;
            }, this)
          });
        }
      },
      destroy: function () {
        
      }
    };

  $.fn.countDown = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method' + method + 'does not exist on jQuery.countDown');
    }
  };

}(jQuery));
