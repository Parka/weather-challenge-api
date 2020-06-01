var express = require('express');
var fetch = require('node-fetch');
var router = express.Router();

const OPEN_WEATHER_KEY = process.env.OPEN_WEATHER_KEY;
const OPEN_WEATHER_ENDPOINT = 'https://api.openweathermap.org/data/2.5';
const IP_API_ENDPOINT = 'http://ip-api.com/json';

const getLocationByReq = async function({connection, hostname}) {
  const isLocal = hostname == 'localhost';
  const response = await fetch(`${IP_API_ENDPOINT}/${isLocal? '' : connection.remoteAddress}`)
  const location = await response.json();
  return location;
};

/* GET location data according to ip-api */
router.get('/location', async function(req, res) {
  const location = await getLocationByReq(req);
  res.json({location});
});

/* GET location data according to ip-api and current weather */
router.get('/current/:city?', async function({params}, res, next) {
  let response = await fetch(`${OPEN_WEATHER_ENDPOINT}/weather?q=${params.city}&appid=${OPEN_WEATHER_KEY}`)
  let weather = await response.json();
  res.json({weather});
});

/* GET location data according to ip-api and 5 day weather forecast */
router.get('/forecast/:city?', async function({params}, res, next) {
  let response = await fetch(`${OPEN_WEATHER_ENDPOINT}/forecast?q=${params.city}&appid=${OPEN_WEATHER_KEY}`)
  let forecast = await response.json();
  res.json({forecast});
});

module.exports = router;
