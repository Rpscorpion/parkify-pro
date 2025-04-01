
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '@/types';
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  getAllUsers: () => Array<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Initial mock users
const INITIAL_MOCK_USERS = [
  {
    id: '1',
    email: 'admin@parkify.com',
    username: 'admin',
    password: 'admin',
    name: 'Admin User',
    role: 'admin' as const,
    createdAt: '2023-01-15'
  },
  {
    id: '2',
    email: 'user@example.com',
    username: 'user',
    password: 'user123',
    name: 'Regular User',
    role: 'user' as const,
    createdAt: '2023-01-20'
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

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // First check initial mock users
      let foundUser = INITIAL_MOCK_USERS.find(u => u.username === username && u.password === password);
      
      // If not found in initial users, check registered users
      if (!foundUser && registeredUsers.length > 0) {
        foundUser = registeredUsers.find(u => u.username === username && u.password === password);
      }
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('parkifyUser', JSON.stringify(userWithoutPassword));
        toast.success(`Welcome back, ${userWithoutPassword.name || userWithoutPassword.username}!`);
      } else {
        throw new Error('Invalid username or password');
      }
    } catch (error) {
      toast.error((error as Error).message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if email or username already exists in initial mock users
      const existsInMockEmail = INITIAL_MOCK_USERS.some(u => u.email === email);
      const existsInMockUsername = INITIAL_MOCK_USERS.some(u => u.username === username);
      
      // Check if email or username already exists in registered users
      const existsInRegisteredEmail = registeredUsers.some(u => u.email === email);
      const existsInRegisteredUsername = registeredUsers.some(u => u.username === username);
      
      if (existsInMockEmail || existsInRegisteredEmail) {
        throw new Error('Email already in use');
      }
      
      if (existsInMockUsername || existsInRegisteredUsername) {
        throw new Error('Username already taken');
      }

      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        username,
        password,
        name: username,
        role: 'user' as const,
        createdAt: new Date().toISOString().split('T')[0]
      };

      // Add to registered users
      const updatedUsers = [...registeredUsers, newUser];
      setRegisteredUsers(updatedUsers);
      
      // Store the updated users list
      localStorage.setItem('parkifyRegisteredUsers', JSON.stringify(updatedUsers));
      
      toast.success('Registration successful! Please login to continue.');
      
      // We don't auto-login the user anymore, they need to go to login page
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
  
  const getAllUsers = () => {
    // Filter out password from each user before returning
    const allUsers = [
      ...INITIAL_MOCK_USERS.map(({ password, ...rest }) => rest),
      ...registeredUsers.map(({ password, ...rest }) => rest)
    ];
    
    return allUsers;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, getAllUsers }}>
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
