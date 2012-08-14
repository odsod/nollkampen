(function ($) {
  $(function () {

    Backbone.LayoutManager.configure({
      fetch: function (template, context) {
        return Handlebars.templates[template];  
      },
      render: function (template, context) {
        return template(context);
      },
      manage: true
    });

    var ResultsHeader = Backbone.View.extend({
      template: 'sb-results-header'
    });

    var scoreBoard = new Backbone.Layout({
      template: 'sb',
      views: {
        '.test': new ResultsHeader()
      }
    });

    $('body').empty().append(scoreBoard.el);
    scoreBoard.render();

  });
}(jQuery));
