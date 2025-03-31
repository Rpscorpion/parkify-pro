
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Car, Calendar, User, Users } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">ParkifyPro</Link>
          <div className="flex items-center gap-4">
            <span>Welcome, {user.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-white">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 bg-gray-100 p-4">
          <nav className="space-y-2">
            <Link
              to="/dashboard"
              className={`flex items-center p-2 rounded-md ${
                isActive('/dashboard') ? 'bg-primary text-white' : 'hover:bg-gray-200'
              }`}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Dashboard
            </Link>

            <Link
              to="/bookings"
              className={`flex items-center p-2 rounded-md ${
                isActive('/bookings') ? 'bg-primary text-white' : 'hover:bg-gray-200'
              }`}
            >
              <Car className="mr-2 h-5 w-5" />
              My Bookings
            </Link>

            {user.role === 'admin' && (
              <>
                <Link
                  to="/admin/bookings"
                  className={`flex items-center p-2 rounded-md ${
                    isActive('/admin/bookings') ? 'bg-primary text-white' : 'hover:bg-gray-200'
                  }`}
                >
                  <Users className="mr-2 h-5 w-5" />
                  All Bookings
                </Link>
                <Link
                  to="/admin/users"
                  className={`flex items-center p-2 rounded-md ${
                    isActive('/admin/users') ? 'bg-primary text-white' : 'hover:bg-gray-200'
                  }`}
                >
                  <User className="mr-2 h-5 w-5" />
                  User Management
                </Link>
              </>
            )}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
