import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = ({ forecastData, unit }) => {
  // Define the temperature label based on the unit
  const temperatureLabel = unit === 'metric' ? 'Temperature (°C)' : 'Temperature (°F)';
  const temperatureUnit = unit === 'metric' ? '°C' : '°F';

  // Prepare data for the chart
  const data = {
    labels: forecastData.map((entry) => entry.dt_txt),
    datasets: [
      {
        label: temperatureLabel,
        data: forecastData.map((entry) => entry.main.temp),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}${temperatureUnit}`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
