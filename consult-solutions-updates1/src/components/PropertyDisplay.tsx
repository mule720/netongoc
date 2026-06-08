import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Phone, Mail, ExternalLink, Home } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  price: number;
  address: string;
  latitude: number;
  longitude: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  imageUrl?: string;
  createdAt: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '0.5rem'
};

export default function PropertyDisplay() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/graphql/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query { properties { id title description propertyType price address latitude longitude bedrooms bathrooms squareFeet imageUrl createdAt } }`
        }),
      });
      const payload = await response.json();
      setProperties(payload?.data?.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetDirections = (latitude: number, longitude: number) => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(googleMapsUrl, '_blank');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getPropertyTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      house: 'bg-blue-100 text-blue-800',
      apartment: 'bg-green-100 text-green-800',
      condo: 'bg-purple-100 text-purple-800',
      townhouse: 'bg-orange-100 text-orange-800',
      commercial: 'bg-red-100 text-red-800',
      land: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading properties...</div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>No Properties Listed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">There are no properties available at the moment. Check back soon!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Property Image */}
            {property.imageUrl && (
              <div className="relative overflow-hidden bg-gray-200 h-48">
                <img
                  src={property.imageUrl}
                  alt={property.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
                {property.price && (
                  <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-lg">
                    {formatPrice(property.price)}
                  </div>
                )}
              </div>
            )}

            <CardHeader>
              <div className="flex items-start justify-between gap-2 mb-2">
                <CardTitle className="line-clamp-2">{property.title}</CardTitle>
                <Badge className={getPropertyTypeColor(property.propertyType)}>
                  {property.propertyType}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Description */}
              {property.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {property.description}
                </p>
              )}

              {/* Property Details */}
              {(property.bedrooms || property.bathrooms || property.squareFeet) && (
                <div className="grid grid-cols-3 gap-2 py-3 border-t border-b">
                  {property.bedrooms !== null && (
                    <div className="text-center">
                      <div className="text-sm font-semibold">{property.bedrooms}</div>
                      <div className="text-xs text-gray-500">Beds</div>
                    </div>
                  )}
                  {property.bathrooms !== null && (
                    <div className="text-center">
                      <div className="text-sm font-semibold">{property.bathrooms}</div>
                      <div className="text-xs text-gray-500">Baths</div>
                    </div>
                  )}
                  {property.squareFeet ? (
                    <div className="text-center">
                      <div className="text-sm font-semibold">{property.squareFeet.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Sq Ft</div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Address */}
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{property.address}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleGetDirections(property.latitude, property.longitude)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Directions
                </Button>
                <Button
                  onClick={() => window.open(`https://www.google.com/maps/?q=${property.latitude},${property.longitude}`, '_blank')}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View Map
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Map View */}
      {isLoaded && properties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Property Locations Map</CardTitle>
            <CardDescription>
              View all properties on the map
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '500px', borderRadius: '0.5rem' }}
              center={{
                lat: properties[0].latitude,
                lng: properties[0].longitude
              }}
              zoom={12}
              options={{
                streetViewControl: false,
                mapTypeControl: true,
                fullscreenControl: true
              }}
            >
              {properties.map((property) => (
                <MarkerF
                  key={property.id}
                  position={{
                    lat: property.latitude,
                    lng: property.longitude
                  }}
                  title={property.title}
                  onClick={() => {
                    // You can add info window here if needed
                    window.open(
                      `https://www.google.com/maps/?q=${property.latitude},${property.longitude}`,
                      '_blank'
                    );
                  }}
                />
              ))}
            </GoogleMap>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
