import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
//import { BlurView } from 'expo-blur';

export default function ModalScreen() {


  const navigateToAdd = (autoScan: boolean) => {
    router.dismiss();
    router.push({
      pathname: '/add',
      params: { startScanning: autoScan ? 'true' : 'false' }
    });
  };

  return (
    <View className="flex-1 justify-end">

      <Pressable 
        className="absolute top-0 bottom-0 left-0 right-0 bg-black/80" 
        onPress={() => router.back()}
      />

      <View className="bg-brand-dark rounded-t-3xl p-5 border-t border-brand-accent w-full">
        
        <View className="items-center mb-6">
            <View className="w-12 h-1.5 bg-gray-600 rounded-full" />
        </View>

        <View className="flex-row gap-4 mb-6">

            <TouchableOpacity 
                className="flex-1 bg-brand-card p-4 rounded-2xl items-center justify-center aspect-square border border-brand-accent"
                onPress={() => navigateToAdd(false)}
            >
                <View className="w-12 h-12 rounded-full bg-blue-500/20 items-center justify-center mb-3">
                    <Ionicons name="search" size={28} color="#3B82F6" />
                </View>
                <Text className="text-white text-center font-semibold">Zarejestruj{'\n'}produkt</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                className="flex-1 bg-brand-card p-4 rounded-2xl items-center justify-center aspect-square border border-brand-accent"
                onPress={() => navigateToAdd(true)}
            >
                <View className="w-12 h-12 rounded-full bg-red-500/20 items-center justify-center mb-3">
                    <Ionicons name="barcode-outline" size={28} color="#EF4444" />
                </View>
                <Text className="text-white text-center font-semibold">Skanuj kod{'\n'}kreskowy</Text>
            </TouchableOpacity>

        </View>

        <View className="bg-brand-card rounded-2xl overflow-hidden border border-brand-accent mb-6">
            
            <TouchableOpacity 
                className="flex-row items-center p-4 border-b border-brand-dark"
                onPress={() => {
                    router.dismiss();
                    router.push('/add');
                }}
            >

                <MaterialCommunityIcons name="chef-hat" size={24} color="#D946EF" style={{ marginRight: 16 }} />
                <Text className="text-white text-lg font-medium">Własny przepis</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-4 border-b border-brand-dark">
                <Ionicons name="scale" size={24} color="#10B981" style={{ marginRight: 16 }} />
                <Text className="text-white text-lg font-medium">Waga</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-4">
                <Ionicons name="flame" size={24} color="#FF9100" style={{ marginRight: 16 }} />
                <Text className="text-white text-lg font-medium">Ćwiczenia</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity 
            className="items-center py-2" 
            onPress={() => router.back()}
        >
            <Text className="text-brand-muted text-lg">Anuluj</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}