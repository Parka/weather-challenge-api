const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const { getName } = require('i18n-iso-countries');


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

/* GET location data according to ip-api (if no city) and current weather */
router.get('/current/:city?', async function(req, res) {
  const {city} = req.params;
  let location = !city && await getLocationByReq(req);
  const response = await fetch(`${OPEN_WEATHER_ENDPOINT}/weather?q=${city || location.city}&appid=${OPEN_WEATHER_KEY}`)
  const weather = await response.json();
  location = location || {
    "country": getName(weather.sys.country, 'en'),
    "countryCode": weather.sys.country,
    "city": weather.name,
    "lat": weather.coord.lat,
    "lon": weather.coord.lon,
  };
  res.json({weather, location});
});

/* GET location data according to ip-api (if no city) and 5 day weather forecast */
router.get('/forecast/:city?', async function(req, res) {
  const {city} = req.params;
  let location = !city && await getLocationByReq(req);
  const response = await fetch(`${OPEN_WEATHER_ENDPOINT}/forecast?q=${city || location.city}&appid=${OPEN_WEATHER_KEY}`)
  const forecast = await response.json();
  location = location || {
    "country": getName(forecast.city.country, 'en'),
    "countryCode": forecast.city.country,
    "city": forecast.city.name,
    "lat": forecast.city.coord.lat,
    "lon": forecast.city.coord.lon,
  };
  res.json({forecast, location});
});

module.exports = router;
