import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, BmrFormula } from '../../Context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../../Services/ImageService';

export default function SettingsScreen() {
  const router = useRouter();
  const { bmrFormula, setBmrFormula, userData, fetchProfile, addWeight } = useAuth();
  
  const [uploading, setUploading] = useState(false);
  
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  const pickAvatar = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
      });

      if (!result.canceled) {
          setUploading(true);
          try {
              const success = await uploadImage('/api/Account/avatar', result.assets[0].uri);
              if (success) {
                  await fetchProfile();
                  Alert.alert("Sukces", "Zdjęcie profilowe zostało zmienione.");
              } else {
                  Alert.alert("Błąd", "Nie udało się wgrać zdjęcia.");
              }
          } catch (e) {
              console.log("Avatar upload error", e);
              Alert.alert("Błąd", "Wystąpił problem podczas wysyłania.");
          } finally {
              setUploading(false);
          }
      }
  };

  const handleUpdateWeight = async () => {
    if (!newWeight) return;
    
    const weightValue = parseFloat(newWeight.replace(',', '.'));

    if (isNaN(weightValue) || weightValue <= 0 || weightValue > 300) {
        Alert.alert("Błąd", "Podaj prawidłową wagę");
        return;
    }

    try {
        await addWeight(weightValue, new Date());
        setWeightModalVisible(false);
        setNewWeight('');
        Alert.alert("Sukces", "Waga zaktualizowana!"); 
    } catch (error) {
        Alert.alert("Błąd", "Wystąpił problem z zapisem wagi");
    }
  };

  const formulas: { id: BmrFormula, name: string, desc: string }[] = [
      { 
          id: 'MifflinStJeor', 
          name: 'Wzór Mifflina-St Jeora', 
          desc: 'Zalecany. Najdokładniejszy dla współczesnej populacji.' 
      },
      { 
          id: 'HarrisBenedict', 
          name: 'Wzór Harrisa-Benedicta', 
          desc: 'Klasyczny wzór z 1919r. Może lekko zawyżać zapotrzebowanie.' 
      }
  ];

  return (
    <View className="flex-1 bg-brand-dark pt-12">
      <View className="px-5 flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 bg-brand-card p-2 rounded-full border border-brand-accent">
          <Ionicons name="arrow-back" size={24} color="#E0AAFF" />
        </TouchableOpacity>
        <Text className="text-brand-text text-2xl font-bold">Ustawienia</Text>
      </View>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
          
          <View className="items-center mb-8 bg-brand-card p-6 rounded-3xl border border-brand-accent">
              <TouchableOpacity onPress={pickAvatar} className="relative mb-3" disabled={uploading}>
                  <View className="w-28 h-28 rounded-full bg-brand-vivid items-center justify-center overflow-hidden border-4 border-brand-dark shadow-xl">
                      {userData?.imageUrl ? (
                          <Image source={{ uri: userData.imageUrl }} className="w-full h-full" resizeMode="cover" />
                      ) : (
                          <Text className="text-white text-4xl font-bold">
                              {userData?.email?.charAt(0).toUpperCase()}
                          </Text>
                      )}
                      
                      {uploading && (
                          <View className="absolute inset-0 bg-black/60 justify-center items-center">
                              <ActivityIndicator color="#E0AAFF" />
                          </View>
                      )}
                  </View>

                  <View className="absolute bottom-0 right-0 bg-brand-primary p-2 rounded-full border-2 border-brand-card">
                      <Ionicons name="camera" size={18} color="white" />
                  </View>
              </TouchableOpacity>
              
              <Text className="text-white font-bold text-xl">{userData?.username || userData?.email}</Text>
              <Text className="text-brand-muted text-sm mt-1">Kliknij w zdjęcie, aby zmienić</Text>
          </View>

          <Text className="text-brand-muted font-bold mb-3 ml-2 uppercase text-xs tracking-wider">Twoje Ciało</Text>
          <View className="bg-brand-card rounded-2xl border border-brand-accent overflow-hidden mb-8">
              <View className="p-5 flex-row justify-between items-center border-b border-brand-dark">
                  <Text className="text-brand-text font-semibold">Aktualna waga</Text>
                  <TouchableOpacity 
                    className="flex-row items-center bg-brand-dark px-3 py-1 rounded-lg border border-brand-muted/30"
                    onPress={() => setWeightModalVisible(true)}
                  >
                      <Text className="text-brand-vivid font-bold text-lg mr-2">
                        {userData?.weight ? `${userData.weight} kg` : '--'}
                      </Text>
                      <Ionicons name="pencil" size={14} color="#E0AAFF" />
                  </TouchableOpacity>
              </View>
              <View className="p-5 flex-row justify-between items-center">
                  <Text className="text-brand-text font-semibold">Wzrost</Text>
                  <Text className="text-brand-muted">{userData?.height ? `${userData.height} cm` : '--'}</Text>
              </View>
          </View>

          <Text className="text-brand-muted font-bold mb-3 ml-2 uppercase text-xs tracking-wider">Kalkulacja Kalorii</Text>
          <View className="bg-brand-card rounded-2xl border border-brand-accent overflow-hidden mb-8">
              {formulas.map((item, index) => {
                  const isSelected = bmrFormula === item.id;
                  return (
                      <TouchableOpacity 
                          key={item.id} 
                          onPress={() => setBmrFormula(item.id)}
                          className={`p-5 flex-row items-start ${index < formulas.length -1 ? 'border-b border-brand-dark' : ''} ${isSelected ? 'bg-brand-primary/10' : ''}`}
                      >
                          <View className={`w-6 h-6 rounded-full border mr-4 items-center justify-center ${isSelected ? 'border-brand-vivid bg-brand-vivid' : 'border-brand-muted'}`}>
                              {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                          </View>
                          <View className="flex-1">
                              <Text className={`font-bold text-base ${isSelected ? 'text-white' : 'text-brand-text'}`}>{item.name}</Text>
                              <Text className="text-brand-muted text-xs mt-1 leading-5">{item.desc}</Text>
                          </View>
                      </TouchableOpacity>
                  )
              })}
          </View>

          <Text className="text-brand-muted font-bold mb-3 ml-2 uppercase text-xs tracking-wider">Aplikacja</Text>
          <View className="bg-brand-card rounded-2xl border border-brand-accent overflow-hidden mb-10">
              <View className="p-5 flex-row justify-between items-center border-b border-brand-dark">
                  <Text className="text-brand-text">Wersja</Text>
                  <Text className="text-brand-muted">1.0.0 (Beta)</Text>
              </View>
              <View className="p-5 flex-row justify-between items-center">
                  <Text className="text-brand-text">Język</Text>
                  <Text className="text-brand-muted">Polski</Text>
              </View>
          </View>

      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={weightModalVisible}
        onRequestClose={() => setWeightModalVisible(false)}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 justify-center items-center bg-black/80"
        >
            <View className="bg-brand-card w-4/5 p-6 rounded-3xl border border-brand-accent">
                <Text className="text-white text-xl font-bold mb-2 text-center">Aktualizuj wagę</Text>
                <Text className="text-brand-muted text-sm mb-6 text-center">Podaj nową wagę, aby zaktualizować swoje zapotrzebowanie kaloryczne.</Text>

                <View className="bg-brand-dark border border-brand-accent rounded-xl p-4 mb-6 flex-row items-center justify-center">
                    <TextInput 
                        className="text-white text-3xl font-bold text-center min-w-[60px]"
                        placeholder="0.0"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        value={newWeight}
                        onChangeText={setNewWeight}
                        autoFocus
                    />
                    <Text className="text-brand-muted font-bold text-xl ml-2">kg</Text>
                </View>

                <View className="flex-row gap-4">
                    <TouchableOpacity 
                        className="flex-1 bg-transparent border border-brand-muted py-3 rounded-xl items-center"
                        onPress={() => setWeightModalVisible(false)}
                    >
                        <Text className="text-brand-muted font-bold">Anuluj</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className="flex-1 bg-brand-primary py-3 rounded-xl items-center"
                        onPress={handleUpdateWeight}
                    >
                        <Text className="text-brand-text font-bold">Zapisz</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}