import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Laptop, DollarSign, ShoppingCart, Briefcase } from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconKey: string;
  serviceAreas: string[];
}

const normalizeServiceAreas = (value: any): string[] => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const SERVICES_QUERY = `
  query {
    services {
      id
      title
      description
      iconKey
      serviceAreas
    }
  }
`;

const iconMap: Record<string, React.ComponentType<any>> = {
  building2: Building2,
  laptop: Laptop,
  dollarsign: DollarSign,
  shoppingcart: ShoppingCart,
  briefcase: Briefcase,
};

const Services: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/graphql/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: SERVICES_QUERY }),
        });

        const payload = await response.json();
        const fetchedServices = payload?.data?.services || [];
        setServices(
          (Array.isArray(fetchedServices) ? fetchedServices : []).map((item: any) => ({
            ...item,
            serviceAreas: normalizeServiceAreas(item?.serviceAreas),
          }))
        );
      } catch {
        setServices([]);
      }
    };

    fetchServices();
  }, []);

  return (
    <section className="relative py-20 bg-slate-950/95">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Our Services
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            We provide comprehensive business solutions tailored to your unique needs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const iconKey = (service.iconKey || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const Icon = iconMap[iconKey] || Briefcase;
            return (
              <Card key={service.id || index} className="rounded-[2rem] border border-white/10 bg-slate-900/90 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.75)] transition duration-500 hover:shadow-[0_30px_80px_-30px_rgba(15,23,42,0.9)]">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300 mb-4">
                    {service.description}
                  </CardDescription>
                  <ul className="space-y-3">
                    {service.serviceAreas.map((area, areaIndex) => (
                      <li key={areaIndex} className="text-sm text-slate-300 flex items-center">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {services.length === 0 && (
          <div className="text-center py-10 text-slate-300">No services available yet.</div>
        )}
      </div>
    </section>
  );
};

export default Services;