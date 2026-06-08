import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import GoogleMapPicker from './GoogleMapPicker';

interface PropertyFormData {
  title: string;
  description: string;
  property_type: string;
  price: string;
  address: string;
  latitude: number;
  longitude: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  image_url?: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export default function PropertyUploadForm() {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    property_type: '',
    price: '',
    address: '',
    latitude: 0,
    longitude: 0,
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 0
  });

  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'bedrooms' || name === 'bathrooms' || name === 'square_feet'
        ? (value === '' ? 0 : parseFloat(value))
        : value
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      property_type: value
    });
  };

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    setFormData({
      ...formData,
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/uploads/property-image/', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!response.ok) throw new Error('Image upload failed');
    const data = await response.json();
    if (!data.url) throw new Error('No URL returned from upload');
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      toast({
        title: 'Error',
        description: 'Please select a location on the map',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.property_type) {
      toast({
        title: 'Error',
        description: 'Please select a property type',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const gqlResponse = await fetch('/graphql/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation CreateProp(
            $title: String!, $description: String, $propertyType: String!,
            $price: Float, $address: String!, $latitude: Float!, $longitude: Float!,
            $bedrooms: Int, $bathrooms: Int, $squareFeet: Int, $imageUrl: String
          ) {
            createProperty(
              title: $title, description: $description, propertyType: $propertyType,
              price: $price, address: $address, latitude: $latitude, longitude: $longitude,
              bedrooms: $bedrooms, bathrooms: $bathrooms, squareFeet: $squareFeet, imageUrl: $imageUrl
            ) { propertyObj { id } }
          }`,
          variables: {
            title: formData.title,
            description: formData.description,
            propertyType: formData.property_type,
            price: formData.price ? parseFloat(formData.price) : null,
            address: formData.address,
            latitude: formData.latitude,
            longitude: formData.longitude,
            bedrooms: formData.bedrooms || null,
            bathrooms: formData.bathrooms || null,
            squareFeet: formData.square_feet || null,
            imageUrl: imageUrl || null,
          },
        }),
      });
      const gqlPayload = await gqlResponse.json();
      if (gqlPayload.errors) throw new Error(gqlPayload.errors[0].message);

      toast({
        title: 'Success!',
        description: 'Property uploaded successfully with location.'
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        property_type: '',
        price: '',
        address: '',
        latitude: 0,
        longitude: 0,
        bedrooms: 3,
        bathrooms: 2,
        square_feet: 0
      });
      setSelectedLocation(null);
      setImageFile(null);
      setImagePreview('');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload property. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Upload New Property</CardTitle>
          <CardDescription>
            Add a new property listing with location details and photos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div>
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Beautiful 3BR House in Downtown"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the property features and details"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="property_type">Property Type *</Label>
                  <Select value={formData.property_type} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g., 500000"
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Property Details</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="square_feet">Square Feet</Label>
                  <Input
                    id="square_feet"
                    name="square_feet"
                    type="number"
                    value={formData.square_feet}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Property Image</h3>
              
              <div>
                <Label htmlFor="image">Upload Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-auto rounded-lg max-h-64 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Location Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location</h3>
              <GoogleMapPicker onLocationSelect={handleLocationSelect} initialLocation={selectedLocation || undefined} />
            </div>

            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading ? 'Uploading Property...' : 'Upload Property'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
