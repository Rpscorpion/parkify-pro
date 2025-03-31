
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '@/types';
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Initial mock users
const INITIAL_MOCK_USERS = [
  {
    id: '1',
    email: 'admin@parkify.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin' as const
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'user123',
    name: 'Regular User',
    role: 'user' as const
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [registeredUsers, setRegisteredUsers] = useState<Array<any>>([]);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('parkifyUser');
    const storedUsers = localStorage.getItem('parkifyRegisteredUsers');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    if (storedUsers) {
      setRegisteredUsers(JSON.parse(storedUsers));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // First check initial mock users
      let foundUser = INITIAL_MOCK_USERS.find(u => u.email === email && u.password === password);
      
      // If not found in initial users, check registered users
      if (!foundUser && registeredUsers.length > 0) {
        foundUser = registeredUsers.find(u => u.email === email && u.password === password);
      }
      
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('parkifyUser', JSON.stringify(userWithoutPassword));
        toast.success(`Welcome back, ${userWithoutPassword.name}!`);
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      toast.error((error as Error).message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if email already exists in initial mock users
      const existsInMock = INITIAL_MOCK_USERS.some(u => u.email === email);
      
      // Check if email already exists in registered users
      const existsInRegistered = registeredUsers.some(u => u.email === email);
      
      if (existsInMock || existsInRegistered) {
        throw new Error('Email already in use');
      }

      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        password,
        name,
        role: 'user' as const
      };

      // Add to registered users
      const updatedUsers = [...registeredUsers, newUser];
      setRegisteredUsers(updatedUsers);
      
      // Store the updated users list
      localStorage.setItem('parkifyRegisteredUsers', JSON.stringify(updatedUsers));
      
      // Store the user without password for current session
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('parkifyUser', JSON.stringify(userWithoutPassword));
      
      toast.success('Registration successful!');
    } catch (error) {
      toast.error((error as Error).message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('parkifyUser');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
