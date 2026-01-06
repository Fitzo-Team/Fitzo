import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../Services/ApiClient';
import { UserProfileDto } from '../Types/Api';

interface UserData extends Partial<UserProfileDto> {
  username?: string;
  email: string;
  goal?: string;
}

interface AuthContextType {
  userToken: string | null;
  userData: UserData | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, profileData: UserData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await SecureStore.getItemAsync('jwt_token');
        if (token) {
          setUserToken(token);
        }
      } catch (e) {
        console.log('Restoring token failed');
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/api/Auth/login', { email, password });
      
      const token = response.data.token || response.data; 

      if (token) {
        await SecureStore.setItemAsync('jwt_token', token);
        setUserToken(token);
        setUserData({ email });
        router.replace('/(tabs)/journal');
      }
    } catch (error) {
      console.error(error);
      alert('Błąd logowania. Sprawdź dane.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, profileData: UserData) => {
    setIsLoading(true);
    try {
      await apiClient.post('/api/Auth/register', { 
        email, 
        password, 
        confirmPassword: password 
      });

      const loginRes = await apiClient.post('/api/Auth/login', { email, password });
      const token = loginRes.data.token || loginRes.data;
      
      await SecureStore.setItemAsync('jwt_token', token);
      setUserToken(token);

      const profileDto: UserProfileDto = {
        weight: Number(profileData.weight) || 70,
        height: Number(profileData.height) || 175,
        age: Number(profileData.age) || 25,
        gender: 'Male'
      };

      await apiClient.post('/api/Users/profile', profileDto);
      
      setUserData({ ...profileData, email });
      router.replace('/(tabs)/journal');

    } catch (error) {
      console.error(error);
      alert('Błąd rejestracji.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await SecureStore.deleteItemAsync('jwt_token');
    setUserToken(null);
    setUserData(null);
    setIsLoading(false);
    // router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ userToken, userData, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);