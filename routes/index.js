var express = require('express');
var router = express.Router();
var parser = require('./parser');


var output = "";
parser.Initialize();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: output });
});

module.exports = router;
