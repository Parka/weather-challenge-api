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
  if(!response.ok) return res.status(500).send();

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
  const response = await fetch(`${OPEN_WEATHER_ENDPOINT}/weather?q=${city || location.city}&appid=${OPEN_WEATHER_KEY}&units=metric`)
  if(!response.ok) return res.status(500).send();

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

  // I'm using the weather endpoint for geocoding, for simplicity
  const weatherResponse = await fetch(`${OPEN_WEATHER_ENDPOINT}/weather?q=${city || location.city}&appid=${OPEN_WEATHER_KEY}&units=metric`);
  if(!weatherResponse.ok) return res.status(500).send();
  const weather = await weatherResponse.json();

  // This endpoint has better formatted data than the 5 day one.
  const response =  await fetch(`${OPEN_WEATHER_ENDPOINT}/onecall?lat=${weather.coord.lat}&lon=${weather.coord.lon}&exclude=hourly,current,minutely&appid=${OPEN_WEATHER_KEY}&units=metric`);
  if(!response.ok) return res.status(500).send();
  const data = await response.json();

  const forecast = data.daily.slice(0,6);

  location = location || {
    "country": getName(weather.sys.country, 'en'),
    "countryCode": weather.sys.country,
    "city": weather.name,
    "lat": weather.coord.lat,
    "lon": weather.coord.lon,
  };
  res.json({forecast, location});
});

module.exports = router;
