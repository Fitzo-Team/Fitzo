import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../Context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login, register, isLoading } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [step, setStep] = useState(1); // 1: Dane konta, 2: Dane fizyczne

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('Utrzymanie wagi');

  const handleNextStep = () => {
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert("Błąd", "Wypełnij wszystkie pola");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Błąd", "Hasła nie są identyczne");
      return;
    }
    setStep(2);
  };

  const handleAuth = () => {
    const mockToken = "jwt_token_123";
    
    if (isLoginMode) {
      // Logowanie
      login(mockToken, { username: 'Jan Kowalski', email });
    } else {
      register(mockToken, { 
        username, email, age, weight, height, goal 
      });
    }
  };

  const InputField = ({ label, val, setVal, secure = false, place, numeric = false }: any) => (
    <View className="mb-4">
      <Text className="text-brand-muted ml-2 mb-2 text-xs uppercase font-bold">{label}</Text>
      <TextInput 
        className="bg-brand-card text-brand-text p-4 rounded-2xl border border-brand-accent focus:border-brand-primary"
        placeholder={place}
        placeholderTextColor="#666"
        secureTextEntry={secure}
        keyboardType={numeric ? 'numeric' : 'default'}
        value={val}
        onChangeText={setVal}
        autoCapitalize="none"
      />
    </View>
  );

  return (
    <View className="flex-1 bg-brand-dark pt-12 px-6">
      <TouchableOpacity onPress={() => router.back()} className="mb-6 w-10 h-10 bg-brand-card rounded-full items-center justify-center">
        <Ionicons name="arrow-back" size={24} color="#E0AAFF" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="items-center mb-8">
          <Text className="text-brand-text text-3xl font-bold">
            {isLoginMode ? 'Witaj ponownie!' : step === 1 ? 'Utwórz konto' : 'Opowiedz o sobie'}
          </Text>
          <Text className="text-brand-muted mt-2 text-center">
            {isLoginMode ? 'Zaloguj się, aby synchronizować dane.' : step === 1 ? 'Dołącz do społeczności Fitzo.' : 'Dostosujemy aplikację do Ciebie.'}
          </Text>
        </View>

        {isLoginMode && (
          <View>
             <InputField label="Email" val={email} setVal={setEmail} place="jan@fitzo.pl" />
             <InputField label="Hasło" val={password} setVal={setPassword} secure place="••••••" />
             
             <TouchableOpacity 
                className="bg-brand-primary h-14 rounded-2xl items-center justify-center mt-4 shadow-lg"
                onPress={handleAuth}
             >
                {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-brand-text font-bold text-lg">Zaloguj się</Text>}
             </TouchableOpacity>
          </View>
        )}

        {!isLoginMode && step === 1 && (
          <View>
             <InputField label="Nazwa użytkownika" val={username} setVal={setUsername} place="FitManiak" />
             <InputField label="Email" val={email} setVal={setEmail} place="jan@fitzo.pl" />
             <InputField label="Hasło" val={password} setVal={setPassword} secure place="••••••" />
             <InputField label="Potwierdź hasło" val={confirmPassword} setVal={setConfirmPassword} secure place="••••••" />

             <TouchableOpacity 
                className="bg-brand-primary h-14 rounded-2xl items-center justify-center mt-4"
                onPress={handleNextStep}
             >
                <Text className="text-brand-text font-bold text-lg">Dalej</Text>
             </TouchableOpacity>
          </View>
        )}

        {!isLoginMode && step === 2 && (
          <View>
             <View className="flex-row gap-4">
                <View className="flex-1"><InputField label="Wiek" val={age} setVal={setAge} place="25" numeric /></View>
                <View className="flex-1"><InputField label="Wzrost (cm)" val={height} setVal={setHeight} place="180" numeric /></View>
             </View>
             <InputField label="Waga (kg)" val={weight} setVal={setWeight} place="75" numeric />
             
             <Text className="text-brand-muted ml-2 mb-2 text-xs uppercase font-bold">Twój cel</Text>
             <View className="flex-row gap-2 mb-6">
                {['Schudnąć', 'Utrzymać', 'Przytyć'].map((g) => (
                  <TouchableOpacity 
                    key={g} 
                    onPress={() => setGoal(g)}
                    className={`flex-1 p-3 rounded-xl border ${goal === g ? 'bg-brand-vivid border-brand-vivid' : 'bg-brand-card border-brand-accent'}`}
                  >
                    <Text className={`text-center text-xs font-bold ${goal === g ? 'text-white' : 'text-brand-muted'}`}>{g}</Text>
                  </TouchableOpacity>
                ))}
             </View>

             <TouchableOpacity 
                className="bg-brand-primary h-14 rounded-2xl items-center justify-center mt-4"
                onPress={handleAuth}
             >
                 {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-brand-text font-bold text-lg">Zakończ</Text>}
             </TouchableOpacity>

             <TouchableOpacity onPress={() => setStep(1)} className="mt-4 items-center">
                <Text className="text-brand-muted">Wróć</Text>
             </TouchableOpacity>
          </View>
        )}


        <View className="flex-row justify-center mt-10 pb-10">
          <Text className="text-brand-muted">
            {isLoginMode ? 'Nie masz konta? ' : 'Masz już konto? '}
          </Text>
          <TouchableOpacity onPress={() => { setIsLoginMode(!isLoginMode); setStep(1); }}>
            <Text className="text-brand-vivid font-bold">
              {isLoginMode ? 'Zarejestruj się' : 'Zaloguj się'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}