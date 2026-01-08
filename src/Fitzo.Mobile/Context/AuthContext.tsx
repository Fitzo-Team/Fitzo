import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../Services/ApiClient';
import { UserProfileDto, AddWeightDto } from '../Types/Api';
import { Alert } from 'react-native';

interface UserData extends Partial<UserProfileDto> {
  username?: string;
  email: string;
  goal?: string;
}

export interface WeightEntry {
    id?: string;
    weight: number;
    date: string;
}

interface AuthContextType {
  userToken: string | null;
  userData: UserData | null;
  weightHistory: WeightEntry[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, profileData: UserData) => Promise<void>;
  logout: () => void;
  addWeight: (weight: number, date: Date) => Promise<void>;
  fetchWeightHistory: () => Promise<void>;
  updateProfile: (profile: UserProfileDto) => Promise<void>;
  fetchBMR: (forceRefresh?: boolean) => Promise<number>;
  fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [userBmr, setUserBmr] = useState<number | null>(null); 
  
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await SecureStore.getItemAsync('jwt_token');
        if (token) {
          setUserToken(token);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          await fetchProfileInternal(); 
        }
      } catch (e) {
        console.log('Restoring token failed');
      }
    };

    bootstrapAsync();
  }, []);

  const fetchProfileInternal = async () => {
      try {
          await fetchWeightHistoryInternal();
          
          // Symulacja odzyskania emaila (w prawdziwej apce dekodujesz JWT)
          setUserData(prev => ({ ...prev, email: 'Zalogowany' }));

      } catch (e) {
          console.error("Nie udało się odświeżyć profilu", e);
      }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/api/Auth/login', { email, password });
      const token = response.data.token || response.data; 

      if (token) {
        await SecureStore.setItemAsync('jwt_token', token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUserToken(token);
        setUserData({ email });
        
        await fetchWeightHistoryInternal();
        
        router.replace('/(tabs)/journal');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Błąd', 'Błąd logowania. Sprawdź dane.');
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
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
      Alert.alert('Błąd', 'Błąd rejestracji.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await SecureStore.deleteItemAsync('jwt_token');
    delete apiClient.defaults.headers.common['Authorization'];
    
    setUserToken(null);
    setUserData(null);
    setUserBmr(null);
    setWeightHistory([]);
    setIsLoading(false);
    router.replace('/login');
  };

  const fetchWeightHistoryInternal = async () => {
      try {
          const res = await apiClient.get('/api/Weight');
          const sorted = (res.data || []).sort((a: any, b: any) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          setWeightHistory(sorted);
      } catch (e) {
          console.error("Błąd historii wagi", e);
      }
  };

  const fetchWeightHistory = async () => {
      await fetchWeightHistoryInternal();
  };

  const addWeight = async (weight: number, date: Date) => {
    setIsLoading(true);
    try {
      const payload: AddWeightDto = {
        weight: weight,
        date: date.toISOString()
      };
      await apiClient.post('/api/Weight', payload);
      
      if (userData) {
          setUserData({ ...userData, weight });
      }
      
      setUserBmr(null); 

      await fetchWeightHistoryInternal();
      Alert.alert("Sukces", "Zapisano nową wagę");
    } catch (e) {
      console.error("Błąd zapisu wagi", e);
      Alert.alert("Błąd", "Nie udało się zapisać wagi");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profile: UserProfileDto) => {
      setIsLoading(true);
      try {
          await apiClient.post('/api/Users/profile', profile);
          setUserData((prev: any) => ({ ...prev, ...profile }));
          setUserBmr(null);
          Alert.alert("Sukces", "Profil zaktualizowany");
      } catch (e) {
          console.error("Błąd profilu", e);
      } finally {
          setIsLoading(false);
      }
  };

  const fetchBMR = async (forceRefresh = false): Promise<number> => {
    if (userBmr !== null && !forceRefresh) {
        console.log(`[CACHE] Używam BMR: ${userBmr}`);
        return userBmr;
    }

    try {
      console.log("[API] Pobieram BMR..."); 
      const res = await apiClient.get('/api/Users/bmr', {
        params: { formula: 'MifflinStJeor' }
      });
      
      const value = res.data?.bmr || res.data?.Bmr;

      if (value) {
          const numValue = Number(value);
          setUserBmr(numValue); 
          return numValue;
      }
      return 2500;
    } catch (e: any) {
      if (e.response && e.response.status === 400) {
          console.log("Brak profilu w bazie (Błąd 400).");
      }
      return 2500;
    }
  };

  const fetchProfile = async () => {
      await fetchProfileInternal();
  };

  return (
    <AuthContext.Provider value={{ 
        userToken, userData, weightHistory, isLoading, 
        login, register, logout, addWeight, fetchWeightHistory, updateProfile, fetchBMR, fetchProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);