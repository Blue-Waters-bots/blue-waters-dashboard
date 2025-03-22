import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { WaterSource } from '@/types/waterQuality';
import { toast } from '@/components/ui/use-toast';

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

    // Set mapbox access token
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    // Get coordinates for the current source or use default
    const coordinates = locationCoordinates[source.name] || [25.9, -24.6];
    
    // Initialize map only once
    if (!map.current) {
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/outdoors-v12',
          center: coordinates,
          zoom: 10,
        });

        // Add navigation controls
        map.current.addControl(
          new mapboxgl.NavigationControl(),
          'top-right'
        );
        
        // Add error handling
        map.current.on('error', (e) => {
          console.error('Mapbox error:', e.error);
          toast({
            title: "Map Error",
            description: "There was an error loading the map. Please try again later.",
            variant: "destructive"
          });
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        toast({
          title: "Map Error",
          description: "Could not initialize the map. Please check your internet connection.",
          variant: "destructive"
        });
      }
    }

    // Update marker when source changes or map loads
    const updateMarker = () => {
      if (!map.current) return;
      
      try {
        // Remove existing marker if it exists
        if (marker.current) {
          marker.current.remove();
        }
        
        // Determine marker color based on metrics status
        const markerColor = source.metrics.some(m => m.status === "danger") ? "#e11d48" : 
                           source.metrics.some(m => m.status === "warning") ? "#f59e0b" : 
                           "#16a34a";
        
        // Create a new marker
        marker.current = new mapboxgl.Marker({
          color: markerColor,
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
      } catch (error) {
        console.error('Error updating marker:', error);
      }
    };

    // If map is already loaded, update marker immediately
    if (map.current && map.current.loaded()) {
      updateMarker();
    } else if (map.current) {
      // Otherwise wait for map to load first
      map.current.on('load', updateMarker);
    }

    return () => {
      // Remove load event listener if it exists
      if (map.current) {
        map.current.off('load', updateMarker);
      }
    };
  }, [source]);

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden shadow-sm border border-gray-100 relative">
      <div ref={mapContainer} className="w-full h-full" />
      {!map.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Loading map...</p>
        </div>
      )}
    </div>
  );
};

export default MapView;
