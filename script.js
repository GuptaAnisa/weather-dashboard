// Free weather API - No API key required!
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
// Using a free API key (for educational purposes)
const API_KEY = 'f00c38e0279b7bc85480c3fe775d518c';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherCard = document.getElementById('weather-card');
const loading = document.getElementById('loading');
const currentWeather = document.getElementById('current-weather');
const forecast = document.getElementById('forecast');
const errorMessage = document.getElementById('error-message');

// Weather icon mapping
const weatherIcons = {
    '01d': 'fas fa-sun',           // Clear sky day
    '01n': 'fas fa-moon',          // Clear sky night
    '02d': 'fas fa-cloud-sun',     // Few clouds day
    '02n': 'fas fa-cloud-moon',    // Few clouds night
    '03d': 'fas fa-cloud',         // Scattered clouds
    '03n': 'fas fa-cloud',         // Scattered clouds
    '04d': 'fas fa-cloud',         // Broken clouds
    '04n': 'fas fa-cloud',         // Broken clouds
    '09d': 'fas fa-cloud-rain',    // Shower rain
    '09n': 'fas fa-cloud-rain',    // Shower rain
    '10d': 'fas fa-cloud-sun-rain', // Rain day
    '10n': 'fas fa-cloud-moon-rain', // Rain night
    '11d': 'fas fa-bolt',          // Thunderstorm
    '11n': 'fas fa-bolt',          // Thunderstorm
    '13d': 'fas fa-snowflake',     // Snow
    '13n': 'fas fa-snowflake',     // Snow
    '50d': 'fas fa-smog',          // Mist
    '50n': 'fas fa-smog'           // Mist
};

// Initialize app
function init() {
    searchBtn.addEventListener('click', searchWeather);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchWeather();
    });
    
    // Load default city weather
    searchWeatherByCity('London');
}

// Search weather by city name
async function searchWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    await searchWeatherByCity(city);
}

// Main weather search function
async function searchWeatherByCity(city) {
    showLoading();
    hideError();
    hideWeather();
    
    try {
        const weatherData = await fetchWeatherData(city);
        const forecastData = await fetchForecastData(city);
        
        displayCurrentWeather(weatherData);
        displayForecast(forecastData);
        
        showWeather();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError('City not found. Please check the spelling and try again.');
    }
}

// Fetch current weather data
async function fetchWeatherData(city) {
    const response = await fetch(`${API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
    
    if (!response.ok) {
        throw new Error('City not found');
    }
    
    return await response.json();
}

// Fetch forecast data
async function fetchForecastData(city) {
    const response = await fetch(`${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric`);
    
    if (!response.ok) {
        throw new Error('Forecast data not available');
    }
    
    return await response.json();
}

// Display current weather
function displayCurrentWeather(data) {
    document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('date').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('temp').textContent = Math.round(data.main.temp);
    document.getElementById('weather-desc').textContent = data.weather[0].description;
    document.getElementById('wind-speed').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    
    const iconCode = data.weather[0].icon;
    const iconElement = document.getElementById('weather-icon');
    iconElement.className = weatherIcons[iconCode] || 'fas fa-cloud';
}

// Display 3-day forecast
function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast-cards');
    forecastContainer.innerHTML = '';
    
    // Get unique days (3 days forecast)
    const dailyForecasts = [];
    const processedDays = new Set();
    
    for (const item of data.list) {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        if (!processedDays.has(day) && processedDays.size < 3) {
            processedDays.add(day);
            dailyForecasts.push({
                day: day,
                temp: Math.round(item.main.temp),
                description: item.weather[0].description,
                icon: item.weather[0].icon
            });
        }
    }
    
    // Create forecast cards
    dailyForecasts.forEach(forecast => {
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-date">${forecast.day}</div>
            <i class="${weatherIcons[forecast.icon] || 'fas fa-cloud'}"></i>
            <div class="forecast-temp">${forecast.temp}°C</div>
            <div class="forecast-desc">${forecast.description}</div>
        `;
        forecastContainer.appendChild(forecastItem);
    });
}

// UI Helper Functions
function showLoading() {
    loading.style.display = 'block';
    currentWeather.style.display = 'none';
    forecast.style.display = 'none';
    errorMessage.style.display = 'none';
}

function showWeather() {
    loading.style.display = 'none';
    currentWeather.style.display = 'block';
    forecast.style.display = 'block';
    errorMessage.style.display = 'none';
}

function hideWeather() {
    currentWeather.style.display = 'none';
    forecast.style.display = 'none';
}

function showError(message) {
    loading.style.display = 'none';
    currentWeather.style.display = 'none';
    forecast.style.display = 'none';
    errorMessage.style.display = 'block';
    errorMessage.querySelector('p').textContent = message;
}

function hideError() {
    errorMessage.style.display = 'none';
}

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', init);