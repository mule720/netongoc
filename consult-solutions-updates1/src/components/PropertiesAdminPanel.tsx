import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit2 } from 'lucide-react';
import PropertyUploadForm from './PropertyUploadForm';

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

export default function PropertiesAdminPanel() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Property>>({});
  const [showUploadForm, setShowUploadForm] = useState(true);
  const { toast } = useToast();

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
      toast({ title: 'Error', description: 'Failed to fetch properties', variant: 'destructive' });
    }
  };

  const handleEdit = (property: Property) => {
    setEditingId(property.id);
    setEditData(property);
  };

  const gql = (query: string, variables?: Record<string, unknown>) =>
    fetch('/graphql/', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    }).then((r) => r.json());

  const handleUpdateProperty = async () => {
    if (!editingId) return;

    setLoading(true);
    try {
      const payload = await gql(
        `mutation UpdateProp($id: ID!, $title: String, $description: String, $propertyType: String, $price: Float, $address: String) {
           updateProperty(id: $id, title: $title, description: $description, propertyType: $propertyType, price: $price, address: $address) {
             propertyObj { id }
           }
         }`,
        {
          id: editingId,
          title: editData.title,
          description: editData.description,
          propertyType: editData.propertyType,
          price: editData.price,
          address: editData.address,
        }
      );
      if (payload.errors) throw new Error(payload.errors[0].message);
      toast({ title: 'Success', description: 'Property updated successfully' });
      setEditingId(null);
      setEditData({});
      fetchProperties();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update property', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    setLoading(true);
    try {
      const payload = await gql(
        `mutation DeleteProp($id: ID!) { deleteProperty(id: $id) { success } }`,
        { id }
      );
      if (payload.errors) throw new Error(payload.errors[0].message);
      toast({ title: 'Success', description: 'Property deleted successfully' });
      fetchProperties();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete property', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      {showUploadForm && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Upload New Property</h2>
            <Button
              variant="outline"
              onClick={() => setShowUploadForm(false)}
            >
              Hide Form
            </Button>
          </div>
          <PropertyUploadForm />
        </div>
      )}

      {!showUploadForm && (
        <Button
          onClick={() => setShowUploadForm(true)}
          className="mb-4"
        >
          + Add New Property
        </Button>
      )}

      {/* Properties List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Manage Properties</h2>
        <div className="space-y-4">
          {properties.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-600">No properties uploaded yet.</p>
              </CardContent>
            </Card>
          ) : (
            properties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {editingId === property.id ? (
                        <div className="space-y-3">
                          <Input
                            value={editData.title || ''}
                            onChange={(e) => setEditData({...editData, title: e.target.value})}
                            placeholder="Title"
                          />
                          <Textarea
                            value={editData.description || ''}
                            onChange={(e) => setEditData({...editData, description: e.target.value})}
                            placeholder="Description"
                            rows={2}
                          />
                          <Select
                            value={editData.propertyType || ''}
                            onValueChange={(value) => setEditData({...editData, propertyType: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
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
                          <Input
                            type="number"
                            value={editData.price || ''}
                            onChange={(e) => setEditData({...editData, price: parseFloat(e.target.value)})}
                            placeholder="Price"
                          />
                          <Input
                            value={editData.address || ''}
                            onChange={(e) => setEditData({...editData, address: e.target.value})}
                            placeholder="Address"
                          />
                        </div>
                      ) : (
                        <>
                          <CardTitle>{property.title}</CardTitle>
                          <CardDescription className="mt-2">
                            {property.propertyType} • {property.price ? `$${property.price.toLocaleString()}` : 'Price TBD'}
                          </CardDescription>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {editingId === property.id ? (
                        <>
                          <Button
                            onClick={handleUpdateProperty}
                            disabled={loading}
                            size="sm"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingId(null);
                              setEditData({});
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleEdit(property)}
                            variant="ghost"
                            size="sm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteProperty(property.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {editingId !== property.id && (
                  <CardContent className="space-y-3">
                    {property.description && (
                      <p className="text-sm text-gray-600">{property.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {property.bedrooms !== null && (
                        <div>
                          <span className="font-semibold">{property.bedrooms}</span> Beds
                        </div>
                      )}
                      {property.bathrooms !== null && (
                        <div>
                          <span className="font-semibold">{property.bathrooms}</span> Baths
                        </div>
                      )}
                      {property.squareFeet && (
                        <div>
                          <span className="font-semibold">{property.squareFeet}</span> Sq Ft
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {new Date(property.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      📍 {property.address}
                    </div>

                    {property.imageUrl && (
                      <img
                        src={property.imageUrl}
                        alt={property.title}
                        className="w-full h-48 object-cover rounded mt-2"
                      />
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 pt-2">
                      <div>Lat: {property.latitude.toFixed(6)}</div>
                      <div>Lng: {property.longitude.toFixed(6)}</div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
