
/*
 * GET home page.
 */

exports.index = function (req, res) {
  res.render('index', { title: 'Express' });
};

exports.section = function (req, res) {
  res.render('section', { title: 'Express', section: {} });
};
