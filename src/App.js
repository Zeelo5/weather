import React, { useState, useEffect } from "react";
import LineChart from "./LineChart";
import MapComponent from "./MapComponent";
import "./index.css"; // Ensure Tailwind CSS is imported here
import axios from "axios";

const apiKey = process.env.REACT_APP_API_KEY;

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [unit, setUnit] = useState(localStorage.getItem("unit") || "metric"); // Default to Celsius
  const [userHistory, setUserHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [allUserHistory, setAllUserHistory] = useState([]);
  const [showFullHistory, setShowFullHistory] = useState(false);

  const saveUserHistory = async (city, temperature) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/user-history",
        {
          userId: "123", // Example userId
          city: city,
          temperature: temperature,
        }
      );
      console.log("History saved:", response.data);
    } catch (error) {
      console.error("Error saving history:", error);
    }
  };

  const fetchUserHistory = async () => {
    try {
      const userId = "123"; // Implement user identification
      const response = await axios.get(
        `http://localhost:5000/api/user-history/${userId}`
      );
      const historyData = response.data;
      // Display only the latest 5 entries initially
      setUserHistory(historyData.slice(-5)); // Latest 5 entries
      setAllUserHistory(historyData); // Store all history for later
    } catch (error) {
      console.error("Error fetching user history:", error);
    }
  };

  const handleUnitChange = (unit) => {
    setUnit(unit);
    localStorage.setItem("unit", unit);
    fetchWeather();
  };

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    document.documentElement.classList.toggle("dark", savedDarkMode);
    fetchUserHistory(); // Fetch user history on component mount
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle("dark", newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
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
          setLat(data.city.coord.lat);
          setLon(data.city.coord.lon);
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

  const handleShowHistory = () => {
    setShowHistory((prevShowHistory) => !prevShowHistory);
  };

  const toggleShowHistory = () => {
    setShowFullHistory(!showFullHistory);
  };

  return (
    <div
      className={`App min-h-screen ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-800"
      } flex flex-col items-center p-6`}
    >
      <h1 className="text-4xl font-bold mb-6">Weather Dashboard</h1>

      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4">
        <div className="flex items-center">
          <label
            htmlFor="darkModeToggle"
            className="mr-2 text-gray-700 dark:text-gray-200"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </label>
          <input
            id="darkModeToggle"
            type="checkbox"
            checked={darkMode}
            onChange={toggleDarkMode}
            className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full cursor-pointer"
          />
          <span
            className={`inline-block w-6 h-6 bg-white rounded-full transform transition-transform ${
              darkMode ? "translate-x-6" : "translate-x-0"
            } dark:bg-gray-800`}
          />
        </div>
      </div>

      {/* Unit Selector and Input Form */}
      <div className="flex flex-col sm:flex-row items-center mb-4">
        <select
          onChange={(e) => handleUnitChange(e.target.value)}
          value={unit}
          className="form-select mr-4 border border-gray-300 rounded-lg p-2 text-gray-700"
        >
          <option value="metric">Celsius</option>
          <option value="imperial">Fahrenheit</option>
        </select>

        {/* City Input and Buttons */}
        <form
          onSubmit={handleSubmit}
          className="mb-6 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2"
        >
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city"
            className={`form-input border ${
              darkMode
                ? "border-gray-700 bg-gray-800 text-gray-100"
                : "border-gray-300 bg-white text-gray-700"
            } rounded-lg p-2 w-full sm:w-auto`}
          />
          <button
            type="submit"
            className={`btn btn-primary px-4 py-2 rounded-lg ${
              darkMode ? "bg-blue-600" : "bg-blue-500"
            } text-white hover:bg-blue-600`}
          >
            Get Weather
          </button>
          <button
            type="button"
            onClick={fetchWeatherByLocation}
            className={`btn btn-primary px-4 py-2 rounded-lg ${
              darkMode ? "bg-blue-600" : "bg-blue-500"
            } text-white hover:bg-blue-600`}
          >
            Get Weather for current Location
          </button>
        </form>

        {/* History Button */}
        <button
          type="button"
          onClick={handleShowHistory}
          className={`btn btn-primary px-4 py-2 rounded-lg ${
            darkMode ? "bg-green-600" : "bg-green-500"
          } text-white hover:bg-green-600 mt-4`}
        >
          {showHistory ? "Hide History" : "Show History"}
        </button>
      </div>

      {showHistory && userHistory.length > 0 && (
        //   <div className="history-container p-4 w-full max-w-lg bg-white shadow-md rounded-lg mt-4">
        //   <button
        //     onClick={toggleShowHistory}
        //     className="btn btn-secondary mb-4"
        //   >
        //     {showFullHistory ? 'Show Latest 5' : 'Show Full History'}
        //   </button>
        //   <ul className="list-disc pl-4">
        //     {(showFullHistory ? allUserHistory : userHistory).map((entry, index) => (
        //       <li key={index} className="mb-2">
        //         <span className="font-semibold">{entry.city}</span>: {entry.temperature}°{unit === 'metric' ? 'C' : 'F'}
        //       </li>
        //     ))}
        //   </ul>
        // </div>
        <div
          className={`history-container p-4 w-full max-w-lg rounded-lg mt-4 ${
            darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
          } shadow-md`}
        >
          <button
            onClick={toggleShowHistory}
            className={`btn btn-secondary mb-4 ${
              darkMode
                ? "bg-gray-600 text-gray-100 hover:bg-gray-700"
                : "bg-gray-300 text-gray-800 hover:bg-gray-400"
            }`}
          >
            {showFullHistory ? "Show Latest 5" : "Show Full History"}
          </button>
          <ul className="list-disc pl-4">
            {(showFullHistory ? allUserHistory : userHistory).map(
              (entry, index) => (
                <li key={index} className="mb-2">
                  <span className="font-semibold">{entry.city}</span>:{" "}
                  {entry.temperature}°{unit === "metric" ? "C" : "F"}
                </li>
              )
            )}
          </ul>
        </div>
      )}

      {/* Weather Display */}
      {weather ? (
        <div className="flex flex-col sm:flex-row gap-4 p-4 max-w-screen-lg w-full">
          <div
            className={`w-full sm:w-1/2 ${
              darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
            } shadow-lg rounded-lg p-4`}
          >
            <h2 className="text-2xl font-semibold mb-2">
              {weather.city?.name || "City not found"}
            </h2>
            <p className="text-lg mb-4">
              {weather.list?.[0]?.weather[0]?.description ||
                "No description available"}
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
