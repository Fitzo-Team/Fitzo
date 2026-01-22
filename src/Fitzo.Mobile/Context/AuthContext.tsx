import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../Services/ApiClient';
import { UserProfileDto, AddWeightDto } from '../Types/Api';
import { Alert } from 'react-native';

export type BmrFormula = 'MifflinStJeor' | 'HarrisBenedict';

interface UserData extends Partial<UserProfileDto> {
  username?: string;
  email: string;
  goal?: string;
  imageUrl?: string;
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
  bmrFormula: BmrFormula;
  userBmr: number | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, profileData: UserData) => Promise<void>;
  logout: () => void;
  addWeight: (weight: number, date: Date) => Promise<void>;
  fetchWeightHistory: () => Promise<void>;
  updateProfile: (profile: UserProfileDto) => Promise<void>;
  fetchBMR: (forceRefresh?: boolean, overrideFormula?: BmrFormula) => Promise<number>;
  fetchProfile: () => Promise<void>;
  setBmrFormula: (formula: BmrFormula) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [userBmr, setUserBmr] = useState<number | null>(null); 
  const [bmrFormula, setBmrFormulaState] = useState<BmrFormula>('MifflinStJeor');
  
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await SecureStore.getItemAsync('jwt_token');
        if (token) {
          console.log("Znaleziono token, przywracam sesję...");
          setUserToken(token);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          await Promise.all([
              fetchProfileInternal(),
              AsyncStorage.getItem('bmr_formula').then(f => {
                  if(f) setBmrFormulaState(f as BmrFormula);
                  setTimeout(() => fetchBMRInternal(true, (f as BmrFormula) || 'MifflinStJeor'), 100);
              })
          ]);
        } else {
            console.log("Brak tokena - użytkownik niezalogowany.");
        }
      } catch (e) {
        console.log('Błąd przywracania sesji:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);


  const logout = async () => {
    setIsLoading(true);
    try { await SecureStore.deleteItemAsync('jwt_token'); } catch (e) {}
    delete apiClient.defaults.headers.common['Authorization'];
    setUserToken(null); setUserData(null); setUserBmr(null); setWeightHistory([]);
    setIsLoading(false);
    router.replace('/login'); 
  };

  const fetchWeightHistoryInternal = async () => {
      try {
          const res = await apiClient.get('/api/Weight');
          const sorted = (res.data || []).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setWeightHistory(sorted);
      } catch (e) { }
  };

  const fetchProfileInternal = async () => {
      try {
          const profileRes = await apiClient.get('/api/Users/profile');
          if (profileRes.data) {
              let imgUrl = profileRes.data.imageUrl;
              if (imgUrl) {
                  const separator = imgUrl.includes('?') ? '&' : '?';
                  imgUrl = `${imgUrl}${separator}t=${new Date().getTime()}`;
              }
              setUserData(prev => ({ ...prev, ...profileRes.data, imageUrl: imgUrl, email: prev?.email || 'Użytkownik' }));
          }
          await fetchWeightHistoryInternal();
      } catch (e: any) {
          if (e.response && e.response.status === 401) { await logout(); }
      }
  };

  const fetchBMRInternal = async (forceRefresh: boolean, formulaToUse: BmrFormula) => {
      if (userBmr !== null && !forceRefresh) return userBmr;
      try {
        const res = await apiClient.get('/api/Users/bmr', { params: { formula: formulaToUse } });
        const value = res.data?.Bmr || res.data?.bmr || res.data; 
        if (value) {
            const numValue = Number(value);
            setUserBmr(numValue); 
            return numValue;
        }
        return 2500;
      } catch (e: any) { return 2500; }
  };

  const fetchBMR = async (forceRefresh = false, overrideFormula?: BmrFormula): Promise<number> => {
      const formulaToUse = overrideFormula || bmrFormula;
      return fetchBMRInternal(forceRefresh, formulaToUse);
  };

  const setBmrFormula = async (formula: BmrFormula) => {
      setBmrFormulaState(formula); 
      await AsyncStorage.setItem('bmr_formula', formula); 
      await fetchBMRInternal(true, formula); 
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
        await fetchProfileInternal();
        await fetchBMR(true);
      }
    } catch (error: any) {
      Alert.alert('Błąd', "Nieprawidłowe dane logowania");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, profileData: UserData) => {
      setIsLoading(true);
      try {
        await apiClient.post('/api/Auth/register', { email, password, confirmPassword: password });
        const loginRes = await apiClient.post('/api/Auth/login', { email, password });
        const token = loginRes.data.token || loginRes.data;
        await SecureStore.setItemAsync('jwt_token', token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUserToken(token);
        const profileDto: UserProfileDto = {
          weight: Number(profileData.weight) || 70, height: Number(profileData.height) || 175,
          age: Number(profileData.age) || 25, gender: 'Male'
        };
        await apiClient.post('/api/Users/profile', profileDto);
        setUserData({ ...profileData, email });
        await fetchWeightHistoryInternal(); 
        await fetchBMR(true); 
      } catch (error: any) {
        Alert.alert('Błąd', "Błąd rejestracji");
      } finally {
        setIsLoading(false);
      }
  };
  
  const addWeight = async (weight: number, date: Date) => {
      try {
        await apiClient.post('/api/Weight', { weight: weight, date: date.toISOString() });
        if (userData) setUserData({ ...userData, weight });
        await fetchWeightHistoryInternal();
        await fetchBMR(true);
        Alert.alert("Sukces", "Zapisano nową wagę");
      } catch (e) { Alert.alert("Błąd", "Nie udało się zapisać wagi"); }
  };

  const updateProfile = async (profile: UserProfileDto) => {
      try {
          await apiClient.post('/api/Users/profile', profile);
          setUserData((prev: any) => ({ ...prev, ...profile }));
          await fetchBMR(true);
          Alert.alert("Sukces", "Profil zaktualizowany");
      } catch (e) { console.error(e); }
  };
  
  const fetchProfile = async () => { await fetchProfileInternal(); };
  const fetchWeightHistory = async () => { await fetchWeightHistoryInternal(); };

  return (
    <AuthContext.Provider value={{ 
        userToken, userData, weightHistory, isLoading, 
        login, register, logout, addWeight, fetchWeightHistory, updateProfile, fetchBMR, fetchProfile, 
        bmrFormula, setBmrFormula, userBmr 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);