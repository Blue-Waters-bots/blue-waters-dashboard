
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { WaterSource } from '@/types/waterQuality';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Default Mapbox token - this should be replaced with a user's token
const DEFAULT_MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZS1kZXYiLCJhIjoiY2xzcG96NGYxMHE0bTJsbzd1cDdqeGI3bCJ9.nFiiI7EhfkGNyInqRnvitg';

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
  const [mapboxToken, setMapboxToken] = useState(() => {
    return localStorage.getItem('mapbox_token') || DEFAULT_MAPBOX_TOKEN;
  });
  const [customToken, setCustomToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Function to initialize or reinitialize the map
  const initializeMap = () => {
    if (!mapContainer.current) return;
    
    // Clear any existing map
    if (map.current && isMapInitialized) {
      try {
        marker.current?.remove();
        marker.current = null;
        map.current.remove();
      } catch (error) {
        console.error('Error removing map:', error);
      }
      map.current = null;
    }
    
    setMapError(null);
    
    // Get coordinates for the current source or use default
    const coordinates = locationCoordinates[source.name] || [25.9, -24.6];
    
    try {
      // Set mapbox access token
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: coordinates,
        zoom: 10,
      });

      // Set flag when map is fully loaded
      map.current.on('load', () => {
        setIsMapInitialized(true);
        addMarker(coordinates);
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );
      
      // Add error handling
      map.current.on('error', (e: { error: { message: string; statusCode?: number } }) => {
        console.error('Mapbox error:', e.error);
        
        // Check if it's an authorization error
        if (e.error?.statusCode === 401 || e.error?.message?.includes('access token')) {
          setMapError('Invalid Mapbox access token. Please provide your own token.');
          setShowTokenInput(true);
        } else {
          toast({
            title: "Map Error",
            description: "There was an error loading the map. Please try again later.",
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Could not initialize the map. Please check your internet connection.');
    }
  };
  
  // Function to add a marker to the map
  const addMarker = (coordinates: [number, number]) => {
    if (!map.current || !isMapInitialized) return;
    
    try {
      // Remove existing marker if it exists
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
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

  // Initialize map on component mount
  useEffect(() => {
    initializeMap();
    
    return () => {
      // Cleanup map on unmount
      if (map.current && isMapInitialized) {
        try {
          if (marker.current) {
            marker.current.remove();
            marker.current = null;
          }
          map.current.remove();
          map.current = null;
          setIsMapInitialized(false);
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
    };
  }, [mapboxToken]);

  // Update marker when source changes
  useEffect(() => {
    if (!map.current || !isMapInitialized) return;
    
    const coordinates = locationCoordinates[source.name] || [25.9, -24.6];
    addMarker(coordinates);
  }, [source, isMapInitialized]);

  // Handle token update
  const handleUpdateToken = () => {
    if (customToken.trim()) {
      // Save token to localStorage for persistence
      localStorage.setItem('mapbox_token', customToken);
      setMapboxToken(customToken);
      setShowTokenInput(false);
      
      // Reinitialize map with new token
      initializeMap();
      
      toast({
        title: "Token Updated",
        description: "Your Mapbox token has been updated.",
      });
    }
  };

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden shadow-sm border border-gray-100 relative">
      {showTokenInput ? (
        <div className="absolute inset-0 z-10 bg-white p-4 flex flex-col justify-center">
          <h3 className="text-sm font-medium mb-2">Mapbox Token Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            To display the map, please enter your Mapbox access token. 
            You can get a token from <a href="https://mapbox.com/" target="_blank" rel="noreferrer" className="text-water-blue hover:underline">mapbox.com</a>.
          </p>
          <div className="flex gap-2 mb-2">
            <Input 
              value={customToken} 
              onChange={(e) => setCustomToken(e.target.value)}
              placeholder="Enter your Mapbox token"
              className="flex-1"
            />
            <Button onClick={handleUpdateToken}>Update</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your token will be stored locally in your browser.
          </p>
        </div>
      ) : null}
      
      <div ref={mapContainer} className="w-full h-full" />
      
      {mapError && !showTokenInput && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <p className="text-gray-500 mb-2">{mapError}</p>
            <Button variant="outline" size="sm" onClick={() => setShowTokenInput(true)}>
              Add Mapbox Token
            </Button>
          </div>
        </div>
      )}
      
      {!isMapInitialized && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Loading map...</p>
        </div>
      )}
    </div>
  );
};

export default MapView;
