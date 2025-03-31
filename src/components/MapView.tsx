import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Define the prop types for MapView
interface MapViewProps {
  source: {
    name: string;
    type: string;
    location: string;
    metrics: { status: string }[];
  };
}

const DEFAULT_MAPBOX_TOKEN = 'pk.eyJ1IjoicGF0cmlvdHRsb3RsbyIsImEiOiJjbThxNWRmczIwOTBuMnFzaHVtcWxiMGRqIn0.KIQZuUskpybMF-MHLenaGg';

const locationCoordinates: Record<string, [number, number]> = {
  "Gaborone Dam": [25.9168, -24.6571],
  "Notwane River": [26.960278, -23.748889],
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

  const locations = [
    { name: "Gaborone Dam", coordinates: [25.9168, -24.6571], status: "safe" },
    { name: "Notwane River", coordinates: [26.960278, -23.748889], status: "danger" },
    { name: "Shashe Dam", coordinates: [27.4222, -21.3667], status: "warning" }
  ];

  // Function to initialize the map
  const initializeMap = () => {
    if (!mapContainer.current) return;

    // Default coordinates for the map center
    const coordinates = locationCoordinates[source?.name] || [25.9, -24.6];

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: coordinates,
        zoom: 10,
      });

      map.current.on('load', () => {
        setIsMapInitialized(true);
        addMultipleMarkers(locations);
      });

      map.current.on('error', (e: { error: { message: string; statusCode?: number } }) => {
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

      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );
    } catch (error) {
      setMapError('Could not initialize the map. Please check your internet connection.');
    }
  };

  // Function to add multiple markers to the map
  const addMultipleMarkers = (locations) => {
    locations.forEach(location => {
      const color = location.status === "danger" ? "#e11d48" :
                   location.status === "warning" ? "#f59e0b" : "#16a34a";

      new mapboxgl.Marker({ color })
        .setLngLat(location.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <strong>${location.name}</strong><br/>
              Status: ${location.status}<br/>
              Location: ${location.coordinates.join(", ")}
            `)
        )
        .addTo(map.current);
    });
  };

  // Initialize map on component mount
  useEffect(() => {
    initializeMap();

    return () => {
      if (map.current && isMapInitialized) {
        if (marker.current) {
          marker.current.remove();
          marker.current = null;
        }
        map.current.remove();
        map.current = null;
      }
    };
  }, [source]);

  // Handle token update
  const handleUpdateToken = () => {
    if (customToken.trim()) {
      localStorage.setItem('mapbox_token', customToken);
      setMapboxToken(customToken);
      setShowTokenInput(false);
      initializeMap();
      toast({
        title: "Token Updated",
        description: "Your Mapbox token has been updated.",
      });
    }
  };

  return (
    <div className="w-full h-80 rounded-lg overflow-hidden shadow-sm border border-gray-100 relative">
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
