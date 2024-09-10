import React, { useState, useEffect } from "react";
import LineChart from "./LineChart";
import MapComponent from "./MapComponent";
import "./index.css"; // Ensure Tailwind CSS is imported here
import axios from 'axios';

const apiKey = process.env.REACT_APP_API_KEY;

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [unit, setUnit] = useState(localStorage.getItem('unit') || 'metric'); // Default to Celsius
  const [userHistory, setUserHistory] = useState([]);

  const saveUserHistory = async (city, temperature) => {
    try {
      const userId = 'some-unique-user-id'; // Implement user identification
      await axios.post('http://localhost:5000/api/user-history', { userId, city, temperature });
    } catch (error) {
      console.error('Error saving user history:', error);
    }
  };

  const fetchUserHistory = async () => {
    try {
      const userId = 'some-unique-user-id'; // Implement user identification
      const response = await axios.get(`http://localhost:5000/api/user-history/${userId}`);
      setUserHistory(response.data);
    } catch (error) {
      console.error('Error fetching user history:', error);
    }
  };

  const handleUnitChange = (unit) => {
    setUnit(unit);
    localStorage.setItem('unit', unit);
    fetchWeather();
  };

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    document.documentElement.classList.toggle('dark', savedDarkMode);
    fetchUserHistory(); // Fetch user history on component mount
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };

  const fetchWeather = async () => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (data && data.city) {
        setWeather(data);
        setForecast(data.list.slice(0, 5));
        setLat(data.city.coord.lat);
        setLon(data.city.coord.lon);
        const temperature = data.list[0].main.temp;
        await saveUserHistory(city, temperature);
      } else {
        setWeather(null);
        setForecast([]);
        setLat(null);
        setLon(null);
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setWeather(null);
      setForecast([]);
      setLat(null);
      setLon(null);
    }
  };

  const fetchWeatherByLocation = async () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${apiKey}`
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        if (data && data.list) {
          setWeather(data);
          setForecast(data.list.slice(0, 5));
          setLat(null);
          setLon(null);
        } else {
          setWeather(null);
          setForecast([]);
          setLat(null);
          setLon(null);
        }
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setWeather(null);
        setForecast([]);
        setLat(null);
        setLon(null);
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather();
  };

  return (
    <div className={`App min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'} flex flex-col items-center p-6`}>
      <h1 className="text-4xl font-bold mb-6">Weather Dashboard</h1>
      <div className="absolute top-4 right-4">
        <div className="flex items-center">
          <label htmlFor="darkModeToggle" className="mr-2 text-gray-700 dark:text-gray-200">
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </label>
          <input
            id="darkModeToggle"
            type="checkbox"
            checked={darkMode}
            onChange={toggleDarkMode}
            className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full cursor-pointer"
          />
          <span
            className={`inline-block w-6 h-6 bg-white rounded-full transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'} dark:bg-gray-800`}
          />
        </div>
      </div>
      <select 
        onChange={(e) => handleUnitChange(e.target.value)} 
        value={unit} 
        className="form-select mt-2 border border-gray-300 rounded-lg p-2 text-gray-700"
      >
        <option value="metric">Celsius</option>
        <option value="imperial">Fahrenheit</option>
      </select>
      <form
        onSubmit={handleSubmit}
        className="mb-6 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2"
      >
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city"
          className={`form-input border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-700'} rounded-lg p-2 w-full sm:w-auto`}
        />
        <button
          type="submit"
          className={`btn btn-primary px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white hover:bg-blue-600`}
        >
          Get Weather
        </button>
        <button
          type="button"
          onClick={fetchWeatherByLocation}
          className={`btn btn-primary px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white hover:bg-blue-600`}
        >
          Get Weather by Location
        </button>
      </form>
      {weather ? (
        <div className="flex flex-col sm:flex-row gap-4 p-4 max-w-screen-lg w-full">
          <div className="w-full sm:w-1/2 bg-white shadow-lg rounded-lg p-4">
            <h2 className="text-2xl font-semibold mb-2">
              {weather.city?.name || "City not found"}
            </h2>
            <p className="text-lg mb-4">
              {weather.list?.[0]?.weather[0]?.description || "No description available"}
            </p>
            <div className="w-full h-64">
              <LineChart forecastData={forecast} unit={unit} />
            </div>
          </div>
          {lat && lon && (
            <div className="w-full sm:w-1/2 h-64 bg-gray-200 rounded-lg">
              <MapComponent lat={lat} lon={lon} />
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-600">
          Please enter a city to get the weather forecast.
        </p>
      )}
    </div>
  );
}

export default App;
