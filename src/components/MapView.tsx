
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { WaterSource } from '@/types/waterQuality';

// Temporary Mapbox token for demonstration
// In a production app, this should be stored in an environment variable
const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZS1kZXYiLCJhIjoiY2xzcG96NGYxMHE0bTJsbzd1cDdqeGI3bCJ9.nFiiI7EhfkGNyInqRnvitg';

interface MapViewProps {
  selectedSource: WaterSource;
}

// These are example coordinates for our water sources
// In a real application, these would come from your database
const locationCoordinates: Record<string, [number, number]> = {
  "Gaborone Dam": [25.9168, -24.6571],
  "Notwane River": [25.9097, -24.6559],
  "Shashe Dam": [27.4222, -21.3667],
};

const MapView: React.FC<MapViewProps> = ({ selectedSource }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !selectedSource) return;

    // Initialize map only once
    if (!map.current) {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: locationCoordinates[selectedSource.name] || [25.9, -24.6], // Default to Botswana
        zoom: 10,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );
    }

    // Update marker when source changes
    if (map.current) {
      // Get coordinates - handle the case where the source name doesn't exist in our coordinates map
      const coordinates = selectedSource.name && locationCoordinates[selectedSource.name] 
        ? locationCoordinates[selectedSource.name] 
        : [25.9, -24.6]; // Default coordinates
      
      // Remove existing marker if it exists
      if (marker.current) {
        marker.current.remove();
      }
      
      // Create a new marker
      marker.current = new mapboxgl.Marker({
        color: selectedSource.metrics && selectedSource.metrics.some(m => m.status === "danger") ? "#e11d48" : 
               selectedSource.metrics && selectedSource.metrics.some(m => m.status === "warning") ? "#f59e0b" : 
               "#16a34a",
      })
        .setLngLat(coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <strong>${selectedSource.name || 'Unknown Location'}</strong><br/>
              ${selectedSource.type || 'Unknown Type'}<br/>
              ${selectedSource.location || 'Unknown Location'}
            `)
        )
        .addTo(map.current);

      // Pan to the new location
      map.current.flyTo({
        center: coordinates,
        essential: true,
        duration: 1000
      });
    }

    return () => {
      // No need to clean up the map as we're keeping it mounted
    };
  }, [selectedSource]);

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden shadow-sm border border-gray-100">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapView;
