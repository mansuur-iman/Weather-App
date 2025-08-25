const searchInput = document.querySelector(".search-input");
const searchBtn = document.querySelector(".search-btn");
const notFoundSection = document.querySelector(".not-found");
const searchCitySection = document.querySelector(".search-city");
const weatherInfoSection = document.querySelector(".weather-info");

const cityName = document.querySelector(".city-name");
const tempStatus = document.querySelector(".temp-status");
const conditionStatus = document.querySelector(".condition-status");
const HumidityValueTxt = document.querySelector(".humidity-value-txt");
const windValueTxt = document.querySelector(".wind-value-txt");
const weatherSummaryImg = document.querySelector(".weather-img");
const currentDateTxt = document.querySelector(".current-date-txt");

const forecastItemContainer = document.querySelector(
  ".forecast-item-container"
);

const sunriseTime = document.getElementById("sunrise-time");
const sunsetTime = document.getElementById("sunset-time");

const apiKey = "S8WH72B285372STEAZFRVSPUQ";

searchBtn.addEventListener("click", () => {
  if (searchInput.value.trim() !== "") {
    updateWeatherInfo(searchInput.value);
    searchInput.value = "";
  }
});

async function getFetchData(city) {
  const appUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${apiKey}`;

  const response = await fetch(appUrl, { mode: "cors" });

  return response.json();
}

function getWeatherIcon(icon) {
  switch (icon) {
    case "clear-day":
      return "clear.png";
    case "clear-night":
      return "night.png";
    case "rain":
      return "rain.png";
    case "snow":
      return "snow.png";
    case "sleet":
      return "sleet.png";
    case "wind":
      return "wind.png";
    case "fog":
      return "fog.png";
    case "cloudy":
      return "cloudy.png";
    case "partly-cloudy-day":
      return "partly-cloudy-day.png";
    case "partly-cloudy-night":
      return "partly-cloudy-night.png";
    default:
      return "default.png";
  }
}

function getCurrentDate() {
  const currentDate = new Date();
  const options = {
    weekday: "short",
    day: "2-digit",
    month: "short",
  };

  return currentDate.toLocaleDateString("en-Gb", options);
}

async function updateWeatherInfo(city) {
  try {
    const weatherData = await getFetchData(city);

    if (weatherData.status && weatherData.status !== 200) {
      showDisplaySection(notFoundSection);
      return;
    }

    console.log(weatherData); // later show this in UI

    const {
      resolvedAddress,
      currentConditions: { temp, humidity, windspeed, conditions, icon },
      days,
    } = weatherData;

    const { sunrise, sunset } = days[0];

    cityName.textContent = resolvedAddress;
    tempStatus.textContent = Math.round(temp) + "°C";
    conditionStatus.textContent = conditions;
    HumidityValueTxt.textContent = humidity + "%";
    windValueTxt.textContent = windspeed + "M/s";
    currentDateTxt.textContent = getCurrentDate();
    sunriseTime.textContent = formatTime(sunrise);
    sunsetTime.textContent = formatTime(sunset);

    weatherSummaryImg.src = `./assets/weather/${getWeatherIcon(icon)}`;

    await updateForecastInfo(city);

    showDisplaySection(weatherInfoSection);
  } catch (err) {
    console.error("Error fetching data:", err);
    showDisplaySection(notFoundSection);
  }
}

async function updateForecastInfo(city) {
  const forecastData = await getFetchData(city);

  forecastItemContainer.innerHTML = "";

  // skip the first element (today) and show next days
  forecastData.days.slice(1, 6).forEach((day) => {
    updateForecastItems(day);
  });
}

function updateForecastItems(weatherData) {
  const { datetime: date, windspeed, icon, temp } = weatherData;

  const dateTaken = new Date(date);
  const dateOption = { day: "2-digit", month: "short" };
  const dateResult = dateTaken.toLocaleDateString("en-US", dateOption);

  const forecastItem = `
    <div class="forecast-item">
      <h5 class="forecast-item-date">${dateResult}</h5>
      <img
        src="./assets/weather/${getWeatherIcon(icon)}"
        alt="${icon}"
        class="forecast-item-img"
      />
      <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
    </div>`;

  forecastItemContainer.insertAdjacentHTML("beforeend", forecastItem);
}

function showDisplaySection(section) {
  [searchCitySection, weatherInfoSection, notFoundSection].forEach(
    (sec) => (sec.style.display = "none")
  );

  section.style.display = "flex";
}

function formatTime(timeString) {
  const today = new Date().toISOString().split("T")[0]; // e.g. "2025-08-24"
  return new Date(`${today}T${timeString}`).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
