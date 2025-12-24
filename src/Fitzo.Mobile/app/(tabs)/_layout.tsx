import { Tabs, router } from 'expo-router';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomFloatingButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className="top-[-20px] justify-center items-center"
    style={{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 3.5,
      elevation: 5,
    }}
  >
    <View className="w-16 h-16 rounded-full bg-[#FF9100] items-center justify-center border-4 border-[#000000]">
      {children}
    </View>
  </TouchableOpacity>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        
        tabBarActiveTintColor: '#E0AAFF',
        tabBarInactiveTintColor: '#5A189A',

        tabBarStyle: {
          height: 60,
          position: 'absolute', 
          
          backgroundColor: '#000000', 
          
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="journal"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="book" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          tabBarButton: (props) => (
            <CustomFloatingButton {...props}>
              <Ionicons name="add" size={30} color="white" />
            </CustomFloatingButton>
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault(); 
            router.push('/modal'); 
          },
        })}
      />

      <Tabs.Screen
        name="recipes"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="restaurant" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="menu" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}