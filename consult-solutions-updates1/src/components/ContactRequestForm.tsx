import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const CREATE_CONTACT_REQUEST_MUTATION = `
  mutation CreateContactRequest($name: String!, $email: String!, $phone: String, $message: String!) {
    createContactRequest(name: $name, email: $email, phone: $phone, message: $message) {
      contact {
        id
        name
        email
        phone
      }
    }
  }
`;

export default function ContactRequestForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/graphql/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: CREATE_CONTACT_REQUEST_MUTATION,
          variables: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: formData.message,
          },
        }),
      });

      const payload = await response.json();
      if (payload.errors?.length) {
        throw new Error(payload.errors[0].message || 'Failed to send your message.');
      }

      const contact = payload.data?.createContactRequest?.contact;
      if (!contact) {
        throw new Error('Failed to send your message.');
      }

      toast({
        title: 'Message sent!',
        description: 'Thanks for reaching out. We will get back to you shortly.',
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send your message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="rounded-[2rem] border border-amber-500/20 bg-slate-900/80 backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(251,191,36,0.25)]">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl text-white">Contact Us</CardTitle>
            <CardDescription className="text-amber-200">
              Send us a message and our team will respond as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="contact-name" className="text-white">Name *</Label>
                  <Input
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-slate-800/50 border-amber-500/30 text-white placeholder:text-amber-200/60 focus:border-amber-400"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact-email" className="text-white">Email *</Label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-slate-800/50 border-amber-500/30 text-white placeholder:text-amber-200/60 focus:border-amber-400"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact-phone" className="text-white">Phone Number</Label>
                  <Input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-slate-800/50 border-amber-500/30 text-white placeholder:text-amber-200/60 focus:border-amber-400"
                    placeholder="+260..."
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contact-message" className="text-white">Message *</Label>
                <Textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="bg-slate-800/50 border-amber-500/30 text-white placeholder:text-amber-200/60 focus:border-amber-400 min-h-32 resize-none"
                  placeholder="Tell us how we can help..."
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-semibold py-3 shadow-lg shadow-amber-500/30 hover:opacity-95"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}