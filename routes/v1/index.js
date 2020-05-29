var express = require('express');
var router = express.Router();

/* GET location data according to ip-api */
router.get('/location', function(req, res, next) {
  res.send('respond with location');
});

/* GET location data according to ip-api and current weather */
router.get('/current', function(req, res, next) {
  res.send('respond with location + current weather');
});

/* GET location data according to ip-api and 5 day weather forecast */
router.get('/forecast', function(req, res, next) {
  res.send('respond with location + weather forecast');
});

module.exports = router;
