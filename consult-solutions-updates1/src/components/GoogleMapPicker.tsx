import { useState, useRef, useEffect } from 'react';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface GoogleMapPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData;
}

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

export default function GoogleMapPicker({ onLocationSelect, initialLocation }: GoogleMapPickerProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const [markerPosition, setMarkerPosition] = useState<{lat: number; lng: number}>(
    initialLocation ? { lat: initialLocation.latitude, lng: initialLocation.longitude } : defaultCenter
  );
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [searchInput, setSearchInput] = useState('');
  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);

  useEffect(() => {
    if (isLoaded && !autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });

    // Get address from coordinates using Geocoder
    const geocoder = new window.google.maps.Geocoder();
    try {
      const result = await geocoder.geocode({ location: { lat, lng } });
      if (result.results && result.results[0]) {
        const foundAddress = result.results[0].formatted_address;
        setAddress(foundAddress);
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: foundAddress
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handleSearchChange = async (value: string) => {
    setSearchInput(value);
    if (!value || !autocompleteRef.current) {
      setSuggestions([]);
      return;
    }

    try {
      const result = await autocompleteRef.current.getPlacePredictions({
        input: value,
        componentRestrictions: { country: 'us' } // Adjust country code as needed
      });
      setSuggestions(result.predictions || []);
    } catch (error) {
      console.error('Autocomplete error:', error);
    }
  };

  const handleSuggestionSelect = async (placeId: string, description: string) => {
    const placesService = new window.google.maps.PlacesService(mapRef.current!);
    
    try {
      const place = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
        placesService.getDetails({ placeId }, (result, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error('Place details not found'));
          }
        });
      });

      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarkerPosition({ lat, lng });
        setAddress(description);
        setSearchInput('');
        setSuggestions([]);

        // Center map on selected location
        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(17);
        }

        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: description
        });
      }
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMarkerPosition({ lat: latitude, lng: longitude });

          if (mapRef.current) {
            mapRef.current.panTo({ lat: latitude, lng: longitude });
            mapRef.current.setZoom(17);
          }

          // Get address from coordinates
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results) => {
            if (results && results[0]) {
              const foundAddress = results[0].formatted_address;
              setAddress(foundAddress);
              onLocationSelect({
                latitude,
                longitude,
                address: foundAddress
              });
            }
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Map...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Select Property Location
        </CardTitle>
        <CardDescription>
          Click on the map to select a location or search for an address
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location-search">Search Address</Label>
          <div className="relative">
            <Input
              id="location-search"
              type="text"
              placeholder="Search for an address..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full"
            />
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 z-50 max-h-48 overflow-y-auto shadow-lg">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.place_id}
                    onClick={() => handleSuggestionSelect(suggestion.place_id, suggestion.description)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0 text-sm"
                  >
                    <div className="font-medium">{suggestion.main_text}</div>
                    <div className="text-xs text-gray-500">{suggestion.secondary_text}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={markerPosition}
          zoom={15}
          onLoad={(map) => {
            mapRef.current = map;
          }}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true
          }}
        >
          <MarkerF position={markerPosition} />
        </GoogleMap>

        <div className="space-y-2">
          <Label htmlFor="location-address">Address</Label>
          <Input
            id="location-address"
            type="text"
            placeholder="Address will be displayed here"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            readOnly
            className="bg-gray-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="text"
              value={markerPosition.lat.toFixed(6)}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="text"
              value={markerPosition.lng.toFixed(6)}
              readOnly
              className="bg-gray-50"
            />
          </div>
        </div>

        <Button onClick={handleGetCurrentLocation} variant="outline" className="w-full">
          <MapPin className="w-4 h-4 mr-2" />
          Use My Current Location
        </Button>
      </CardContent>
    </Card>
  );
}
