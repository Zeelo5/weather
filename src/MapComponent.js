import { useEffect } from 'react';
import L from 'leaflet';
// In your component file
import 'leaflet/dist/leaflet.css';


const customIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png', // Example custom icon URL
    iconSize: [12, 21], // Default size for Leaflet icons
    iconAnchor: [12, 21], // Bottom center
    popupAnchor: [1, -22], // Position of the popup relative to the iconAnchor
  });
  


const MapComponent = ({ lat = 0, lon = 0 }) => {
    useEffect(() => {
      if (!lat || !lon) return; // Return if lat or lon are not available
  
      // Initialize the map
      const map = L.map('map').setView([lat, lon], 13);
  
      // Add the tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © OpenStreetMap contributors',
      }).addTo(map);
  
      // Define the popup content
      const popupContent = `
        <strong>Location:</strong> (${lat.toFixed(4)}, ${lon.toFixed(4)}) <br>
        <strong>Latitude:</strong> ${lat} <br>
        <strong>Longitude:</strong> ${lon}
      `;
  
      // Add marker with custom icon and detailed popup
      L.marker([lat, lon], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent)
        .openPopup();
  
      // Clean up the map instance on component unmount
      return () => {
        map.remove();
      };
    }, [lat, lon]);
  
    return <div id="map" style={{ height: '400px', width: '100%' }}></div>;
  };

  
  export default MapComponent;