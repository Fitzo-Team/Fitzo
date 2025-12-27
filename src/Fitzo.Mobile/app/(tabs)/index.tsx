import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../Context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { userToken, userData } = useAuth();

  return (
    // Tło: #10002B
    <SafeAreaView className="flex-1 bg-brand-dark">
      
      <View className="flex-row justify-between items-center px-5 py-3">
        
        <TouchableOpacity 
            onPress={() => router.push('/profile')}
            className={`w-10 h-10 rounded-full items-center justify-center border border-brand-accent ${userToken ? 'bg-brand-vivid' : 'bg-brand-card'}`}
        >
            {userToken && userData?.username ? (
                <Text className="text-white font-bold text-lg">
                    {userData.username.charAt(0).toUpperCase()}
                </Text>
            ) : (
                <Ionicons name="person" size={20} color="white" />
            )}
        </TouchableOpacity>

        <Text className="text-2xl font-black text-white tracking-tighter">
          fitzo<Text className="text-brand-vivid">.</Text>
        </Text>

        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={28} color="white" />
          <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-brand-dark" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        <View className="px-5 mb-4 mt-2 flex-row justify-between items-end">
            <Text className="text-3xl font-bold text-white">Dzisiaj</Text>
            <TouchableOpacity>
                <Text className="text-brand-muted font-semibold mb-1">Edytuj</Text>
            </TouchableOpacity>
        </View>

        <View className="mx-5 bg-brand-card rounded-3xl p-6 shadow-lg mb-5 border border-brand-accent">
            <View className="flex-row justify-between items-start mb-4">
                <Text className="text-white text-lg font-bold">Kalorie</Text>
                <Text className="text-brand-muted text-xs">Cel - Posiłki + Ćwicz.</Text>
            </View>

            <View className="flex-row items-center">
                <View className="w-28 h-28 rounded-full border-[8px] border-brand-vivid justify-center items-center mr-6">
                    <Text className="text-white text-3xl font-bold">1 501</Text>
                    <Text className="text-brand-muted text-xs">Pozostało</Text>
                </View>

                <View className="flex-1 gap-3">
                    <View>
                        <Text className="text-brand-muted text-xs">Cel podstawowy</Text>
                        <Text className="text-white font-bold text-lg">2 500</Text>
                    </View>
                    <View>
                        <Text className="text-brand-muted text-xs">Posiłki</Text>
                        <Text className="text-white font-bold text-lg">999</Text>
                    </View>
                </View>
            </View>
        </View>

        <View className="mx-5 bg-brand-card rounded-3xl p-6 shadow-lg mb-5 border border-brand-accent">
            
            <Text className="text-white text-lg font-bold mb-4">Makroskładniki</Text>

            <View className="gap-5">
                
                <View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-brand-text font-semibold">Białko</Text>
                        <Text className="text-brand-muted text-xs">110 / 180 g</Text>
                    </View>
                    
                    <View className="h-3 bg-brand-dark rounded-full overflow-hidden">
                        <View className="h-full w-[60%] bg-blue-500 rounded-full" />
                    </View>
                </View>

                <View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-brand-text font-semibold">Węglowodany</Text>
                        <Text className="text-brand-muted text-xs">140 / 250 g</Text>
                    </View>
                    
                    <View className="h-3 bg-brand-dark rounded-full overflow-hidden">
                        <View className="h-full w-[45%] bg-green-500 rounded-full" />
                    </View>
                </View>

                <View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-brand-text font-semibold">Tłuszcze</Text>
                        <Text className="text-brand-muted text-xs">30 / 70 g</Text>
                    </View>
                    
                    <View className="h-3 bg-brand-dark rounded-full overflow-hidden">
                        <View className="h-full w-[30%] bg-brand-flame rounded-full" />
                    </View>
                </View>

            </View>
        </View>

        <View className="mx-5 flex-row gap-4 mb-5">
            
            <View className="flex-1 bg-brand-card p-4 rounded-3xl justify-between h-36 border border-brand-accent">
                <View>
                    <Text className="text-brand-muted font-semibold mb-1">Kroki</Text>
                    <Ionicons name="footsteps" size={24} color="#E0AAFF" /> 
                </View>
                <View>
                    <Text className="text-2xl font-bold text-white">1 901</Text>
                    <Text className="text-xs text-brand-muted">Cel: 10 000</Text>
                    <View className="h-2 bg-brand-dark rounded-full mt-2 overflow-hidden">
                        <View className="h-full bg-brand-vivid w-[20%]" />
                    </View>
                </View>
            </View>

            <View className="flex-1 bg-brand-card p-4 rounded-3xl justify-between h-36 border border-brand-accent">
                <View className="flex-row justify-between items-start">
                    <Text className="text-white font-semibold">Ćwiczenia</Text>
                    <Ionicons name="add" size={20} color="#C77DFF" />
                </View>
                
                <View className="gap-2">
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="flame" size={22} color="#FF9100" />
                        <Text className="text-white text-lg font-bold">120 kcal</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="time" size={22} color="#FF9100" />
                        <Text className="text-white text-lg font-bold">0:45 h</Text>
                    </View>
                </View>
            </View>

        </View>

        <View className="mx-5 bg-brand-card rounded-3xl p-5 mb-5 flex-row justify-between items-center border border-brand-accent">
             <View>
                <Text className="text-brand-muted font-semibold mb-1">Waga</Text>
                <Text className="text-3xl font-bold text-white">75.5 <Text className="text-lg text-brand-muted font-normal">kg</Text></Text>
             </View>
             <TouchableOpacity className="bg-brand-primary p-3 rounded-full">
                <Ionicons name="add" size={24} color="white" />
             </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}