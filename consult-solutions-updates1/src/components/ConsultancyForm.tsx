import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, Building2, Briefcase } from 'lucide-react';

const CREATE_CONSULTANCY_REQUEST_MUTATION = `
  mutation CreateConsultancyRequest(
    $name: String!
    $email: String!
    $company: String
    $phone: String
    $service: String!
    $message: String
  ) {
    createConsultancyRequest(
      name: $name
      email: $email
      company: $company
      phone: $phone
      service: $service
      message: $message
    ) {
      success
      message
      consultancyRequest {
        id
        name
        email
      }
    }
  }
`;

const SERVICES_QUERY = `
  query {
    services {
      id
      title
      isActive
    }
  }
`;

export default function ConsultancyForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    service: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [serviceOptions, setServiceOptions] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/graphql/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: SERVICES_QUERY }),
        });

        const payload = await response.json();
        const services = payload?.data?.services || [];
        if (Array.isArray(services) && services.length) {
          setServiceOptions(
            services
              .filter((item: any) => item?.isActive !== false)
              .map((item: any) => item?.title)
              .filter(Boolean)
          );
        }
      } catch {
        // Keep form functional even if services fetch fails.
      }
    };

    fetchServices();
  }, []);

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
          query: CREATE_CONSULTANCY_REQUEST_MUTATION,
          variables: {
            name: formData.name,
            email: formData.email,
            company: formData.company || null,
            phone: formData.phone || null,
            service: formData.service,
            message: formData.message || null,
          },
        }),
      });

      const payload = await response.json();
      
      if (payload.errors?.length) {
        throw new Error(payload.errors[0].message || 'Failed to submit request.');
      }

      const result = payload.data?.createConsultancyRequest;
      if (!result?.success) {
        throw new Error(result?.message || 'Failed to submit request.');
      }

      toast({
        title: 'Success!',
        description: result.message || 'Your consultancy request has been submitted. We\'ll be in touch soon!',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        service: '',
        message: ''
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit your request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center rounded-full bg-purple-500/20 px-4 py-2 text-sm text-purple-200 tracking-[0.12em] uppercase shadow-sm shadow-purple-500/30 mb-4">
            Get Started Today
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Request Consultancy
          </h2>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Get in touch with our experts for personalized business solutions tailored to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-[2rem] border border-purple-500/20 bg-slate-900/80 backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(147,51,234,0.3)]">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Expert Consultation</h3>
                <p className="text-purple-200 text-sm">
                  Connect with our seasoned consultants for strategic guidance and innovative solutions.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border border-purple-500/20 bg-slate-900/80 backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(147,51,234,0.3)]">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Tailored Solutions</h3>
                <p className="text-purple-200 text-sm">
                  Customized strategies designed specifically for your business challenges and goals.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border border-purple-500/20 bg-slate-900/80 backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(147,51,234,0.3)]">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Proven Results</h3>
                <p className="text-purple-200 text-sm">
                  Track record of delivering measurable outcomes and sustainable business growth.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="rounded-[2rem] border border-purple-500/20 bg-slate-900/80 backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(147,51,234,0.3)]">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-white">Start Your Journey</CardTitle>
                <CardDescription className="text-purple-200">
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-white">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company" className="text-white">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400"
                        placeholder="Your company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-white">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="service" className="text-white">Service Requested *</Label>
                    {serviceOptions.length ? (
                      <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            service: e.target.value,
                          }))
                        }
                        className="w-full h-10 rounded-md bg-slate-800/50 border border-purple-500/30 text-white px-3 focus:outline-none focus:border-purple-400"
                        required
                      >
                        <option value="" disabled>
                          Select a service
                        </option>
                        {serviceOptions.map((service) => (
                          <option key={service} value={service} className="text-black">
                            {service}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400"
                        placeholder="e.g., Business Strategy, Digital Transformation, etc."
                        required
                      />
                    )}
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-white">Project Details</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400 min-h-32 resize-none"
                      placeholder="Tell us more about your project, your goals, timeline, and any specific requirements..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold py-3 shadow-lg shadow-purple-500/30 hover:opacity-95"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </Button>

                  <p className="text-slate-400 text-xs text-center">
                    We typically respond to consultancy requests within 24 business hours. Thank you for reaching out!
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}