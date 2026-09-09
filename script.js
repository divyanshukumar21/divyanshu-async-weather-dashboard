
const weatherCodes = {
  0: ["☀️", "Clear sky"], 1: ["🌤️", "Mainly clear"], 2: ["⛅", "Partly cloudy"],
  3: ["☁️", "Overcast"], 45: ["🌫️", "Foggy"], 48: ["🌫️", "Rime fog"],
  51: ["🌦️", "Light drizzle"], 53: ["🌦️", "Drizzle"], 55: ["🌧️", "Heavy drizzle"],
  61: ["🌧️", "Slight rain"], 63: ["🌧️", "Rain"], 65: ["🌧️", "Heavy rain"],
  71: ["🌨️", "Light snow"], 73: ["🌨️", "Snow"], 75: ["❄️", "Heavy snow"],
  80: ["🌦️", "Rain showers"], 81: ["🌧️", "Rain showers"], 82: ["⛈️", "Heavy showers"],
  95: ["⛈️", "Thunderstorm"], 96: ["⛈️", "Thunderstorm with hail"], 99: ["⛈️", "Severe thunderstorm"]
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#weather-form");
  if (!form) return;

  const cityInput = document.querySelector("#city");
  const status = document.querySelector("#weather-status");
  const result = document.querySelector("#weather-result");

  async function getWeather(city) {
    status.className = "loading";
    status.textContent = "Loading weather data...";
    result.hidden = true;

    try {
      const geoURL = "https://geocoding-api.open-meteo.com/v1/search?name=" +
        encodeURIComponent(city) + "&count=1&language=en&format=json";

      const geoResponse = await fetch(geoURL);
      if (!geoResponse.ok) throw new Error("Could not connect to the location service.");
      const geoData = await geoResponse.json();

      if (!geoData.results || !geoData.results.length) {
        throw new Error("City not found. Please enter another city name.");
      }

      const place = geoData.results[0];

      const weatherURL =
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}` +
        `&longitude=${place.longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
        `&timezone=auto`;

      const weatherResponse = await fetch(weatherURL);
      if (!weatherResponse.ok) throw new Error("Weather data is currently unavailable.");

      const weatherData = await weatherResponse.json();
      renderWeather(place, weatherData.current, weatherData.current_units);
      status.textContent = "Live weather loaded successfully.";
      status.className = "loading";
    } catch (error) {
      status.textContent = error.message;
      status.className = "error";
    }
  }

  function renderWeather(place, current, units) {
    const code = weatherCodes[current.weather_code] || ["🌡️", "Weather unavailable"];
    document.querySelector("#location-name").textContent =
      `${place.name}${place.admin1 ? ", " + place.admin1 : ""}${place.country ? ", " + place.country : ""}`;

    document.querySelector("#weather-icon").textContent = code[0];
    document.querySelector("#temperature").textContent =
      `${Math.round(current.temperature_2m)}${units.temperature_2m}`;
    document.querySelector("#weather-description").textContent = code[1];

    document.querySelector("#feels-like").textContent =
      `${Math.round(current.apparent_temperature)}${units.apparent_temperature}`;
    document.querySelector("#humidity").textContent =
      `${current.relative_humidity_2m}${units.relative_humidity_2m}`;
    document.querySelector("#wind").textContent =
      `${Math.round(current.wind_speed_10m)} ${units.wind_speed_10m}`;

    result.hidden = false;
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (city) getWeather(city);
  });

  getWeather("New Delhi");
});
