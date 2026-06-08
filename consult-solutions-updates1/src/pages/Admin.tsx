import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPanel from '@/components/AdminPanel';
import Login from '@/components/Login';

const ME_QUERY = `
  query Me {
    me {
      id
      email
    }
  }
`;

const LOGOUT_MUTATION = `
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkKey, setCheckKey] = useState(0);
  const navigate = useNavigate();

  const checkUser = async (isRetry = false, maxRetries = 5) => {
    let retryCount = isRetry ? 0 : 0;
    
    const performCheck = async () => {
      try {
        const response = await fetch('/graphql/', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: ME_QUERY }),
        });

        const payload = await response.json();
        const me = payload.data?.me;
        
        if (me && me.id) {
          setUser(me);
          setLoading(false);
          return true;
        }
        
        if (retryCount < maxRetries) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 500));
          return performCheck();
        } else {
          setUser(null);
          setLoading(false);
          return false;
        }
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 500));
          return performCheck();
        } else {
          setUser(null);
          setLoading(false);
          return false;
        }
      }
    };

    return performCheck();
  };

  useEffect(() => {
    checkUser();
  }, [checkKey]);

  const handleLogout = async () => {
    try {
      await fetch('/graphql/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: LOGOUT_MUTATION }),
      });
    } finally {
      setUser(null);
      navigate('/admin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user?.id) {
    return <Login onLoginSuccess={() => setCheckKey(prev => prev + 1)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900/95 border-b border-white/10 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">NETON Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-slate-300">Welcome, {user.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <AdminPanel />
    </div>
  );
}