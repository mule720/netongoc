import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, Calendar, TrendingUp } from 'lucide-react';

interface Update {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export default function Updates() {
  const [updates, setUpdates] = useState<Update[]>([]);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const response = await fetch('/graphql/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query { companyUpdates(published: true) { id title content imageUrl createdAt } }`
        }),
      });
      const payload = await response.json();
      setUpdates(payload?.data?.companyUpdates || []);
    } catch (error) {
      console.error('Error fetching updates:', error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full bg-orange-500/20 px-4 py-2 text-sm text-orange-200 tracking-[0.12em] uppercase shadow-sm shadow-orange-500/30 mb-4">
            Latest News
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Company Updates
          </h2>
          <p className="text-xl text-orange-200 max-w-3xl mx-auto">
            Stay informed about our latest news, announcements, and industry insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {updates.map((update) => (
            <Card key={update.id} className="rounded-[2rem] border border-orange-500/20 bg-slate-900/80 backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(245,158,11,0.3)] hover:shadow-[0_30px_80px_-30px_rgba(245,158,11,0.4)] transition duration-500">
              <CardHeader className="pb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                  <Newspaper className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl text-white line-clamp-2">{update.title}</CardTitle>
                <div className="flex items-center text-sm text-orange-200 mt-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(update.createdAt).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-orange-200 text-sm leading-relaxed line-clamp-4 mb-4">{update.content}</p>
                {update.imageUrl && (
                  <img
                    src={update.imageUrl}
                    alt={update.title}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                )}
              </CardContent>
            </Card>
          ))}

          {updates.length === 0 && (
            <div className="col-span-full">
              <Card className="rounded-[2rem] border border-orange-500/20 bg-slate-900/80 backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(245,158,11,0.3)]">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Updates Yet</h3>
                  <p className="text-orange-200">Check back soon for the latest company news and announcements.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}