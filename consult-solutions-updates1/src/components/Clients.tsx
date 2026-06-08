import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Star, Award } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  logo: string;
  industry: string;
  isFeatured: boolean;
}

interface CompanyStats {
  clientSatisfaction: string;
  yearsExperience: string;
}

const Clients: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [clients, setClients] = useState<Client[]>([]);
  const [companiesServed, setCompaniesServed] = useState(0);
  const [stats, setStats] = useState<CompanyStats>({ clientSatisfaction: '98%', yearsExperience: '15+' });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/graphql/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query { clients(featured: true) { id name logo industry isFeatured } companyStats { clientSatisfaction yearsExperience } companiesServed }`
        }),
      });
      const payload = await response.json();
      const data: Client[] = payload?.data?.clients || [];
      const fetchedStats = payload?.data?.companyStats;
      const served = Number(payload?.data?.companiesServed || 0);

      setCompaniesServed(served);
      if (fetchedStats) {
        setStats({
          clientSatisfaction: fetchedStats.clientSatisfaction || '98%',
          yearsExperience: fetchedStats.yearsExperience || '15+',
        });
      }
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    }
  };

  useEffect(() => {
    if (clients.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.max(1, Math.ceil(clients.length / 4)));
      }, 3000); // Change every 3 seconds

      return () => clearInterval(interval);
    }
  }, [clients.length]);

  // Show 4 clients at a time
  const visibleClients = [];
  for (let i = 0; i < 4; i++) {
    const index = (currentIndex * 4 + i) % clients.length;
    if (clients[index]) visibleClients.push(clients[index]);
  }

  if (clients.length === 0) {
    return (
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto text-center py-12">
          <p className="text-slate-300">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center rounded-full bg-emerald-500/20 px-4 py-2 text-sm text-emerald-200 tracking-[0.12em] uppercase shadow-sm shadow-emerald-500/30 mb-4">
            Trusted Partners
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Companies We've Worked With
          </h2>
          <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
            Partnering with leading organizations across diverse industries to deliver exceptional results
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="rounded-[2rem] border border-emerald-500/20 bg-slate-900/80 backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(16,185,129,0.3)]">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20 mx-auto">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{companiesServed}+</div>
              <p className="text-emerald-200 text-sm">Companies Served</p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-emerald-500/20 bg-slate-900/80 backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(16,185,129,0.3)]">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20 mx-auto">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stats.clientSatisfaction}</div>
              <p className="text-emerald-200 text-sm">Client Satisfaction</p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-emerald-500/20 bg-slate-900/80 backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(16,185,129,0.3)]">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20 mx-auto">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stats.yearsExperience}</div>
              <p className="text-emerald-200 text-sm">Years Experience</p>
            </CardContent>
          </Card>
        </div>

        {/* Client Slideshow */}
        <div className="relative">
          <div className="overflow-hidden">
            <div className="flex transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentIndex * 25}%)` }}>
              {clients.concat(clients.slice(0, 4)).map((client, index) => (
                <div key={`${client.name}-${index}`} className="flex-shrink-0 w-1/4 px-3">
                  <Card className="rounded-[2rem] border border-emerald-500/20 bg-slate-900/80 backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(16,185,129,0.3)] hover:shadow-[0_30px_80px_-30px_rgba(16,185,129,0.4)] transition duration-500">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">{client.logo}</div>
                      <h3 className="text-lg font-semibold text-white mb-1">{client.name}</h3>
                      <p className="text-emerald-200 text-sm">{client.industry}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.ceil(clients.length / 4) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * 4)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / 4) === index
                    ? 'bg-emerald-500'
                    : 'bg-emerald-500/30 hover:bg-emerald-500/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clients;