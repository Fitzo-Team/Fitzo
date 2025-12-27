import React, { createContext, useState, useContext } from 'react';
import { useRouter } from 'expo-router';

interface UserData {
  username: string;
  email: string;
  age?: string;
  weight?: string;
  height?: string;
  goal?: string;
}

interface AuthContextType {
  userToken: string | null;
  userData: UserData | null;
  isLoading: boolean;
  login: (token: string, data?: UserData) => void;
  register: (token: string, data: UserData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const login = (token: string, data: UserData = { username: 'Użytkownik', email: 'demo@fitzo.pl' }) => {
    setIsLoading(true);
    setTimeout(() => {
      setUserToken(token);
      setUserData(data);
      setIsLoading(false);
      router.replace('/(tabs)/profile');
    }, 1000);
  };

  const register = (token: string, data: UserData) => {
    login(token, data);
  };

  const logout = () => {
    setIsLoading(true);
    setTimeout(() => {
      setUserToken(null);
      setUserData(null);
      setIsLoading(false);
    }, 500);
  };

  return (
    <AuthContext.Provider value={{ userToken, userData, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);