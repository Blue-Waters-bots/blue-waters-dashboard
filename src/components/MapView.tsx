import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { WaterSource } from '@/types/waterQuality';

// Temporary Mapbox token for demonstration
// In a production app, this should be stored in an environment variable
const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZS1kZXYiLCJhIjoiY2xzcG96NGYxMHE0bTJsbzd1cDdqeGI3bCJ9.nFiiI7EhfkGNyInqRnvitg';

interface MapViewProps {
  source: WaterSource;
}

// These are example coordinates for our water sources
// In a real application, these would come from your database
const locationCoordinates: Record<string, [number, number]> = {
  "Gaborone Dam": [25.9168, -24.6571],
  "Notwane River": [25.9097, -24.6559],
  "Shashe Dam": [27.4222, -21.3667],
};

const MapView: React.FC<MapViewProps> = ({ source }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map only once
    if (!map.current) {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: locationCoordinates[source.name] || [25.9, -24.6], // Default to Botswana
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
      const coordinates = locationCoordinates[source.name] || [25.9, -24.6];
      
      // Remove existing marker if it exists
      if (marker.current) {
        marker.current.remove();
      }
      
      // Create a new marker
      marker.current = new mapboxgl.Marker({
        color: source.metrics.some(m => m.status === "danger") ? "#e11d48" : 
               source.metrics.some(m => m.status === "warning") ? "#f59e0b" : 
               "#16a34a",
      })
        .setLngLat(coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <strong>${source.name}</strong><br/>
              ${source.type}<br/>
              ${source.location}
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
  }, [source]);

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden shadow-sm border border-gray-100">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapView;
