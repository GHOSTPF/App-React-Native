import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import ProfileScreen from './screens/ProfileScreen';
import PointsTableScreen from './screens/PointsTableScreen';
import LoginScreen from './screens/LoginScreen';
import { PointsProvider } from './screens/PointsProvider';
import RegisterScreen from './screens/RegisterScreen';
import PointConfirmationScreen from './screens/PointConfirmationScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';

const Stack = createStackNavigator();

export default function App() {
  const handleLogout = async (navigation) => {
    // Limpar qualquer dado de autenticação armazenado
    await AsyncStorage.removeItem('userToken');
    // Navegar para a tela de login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <NavigationContainer>
      <PointsProvider>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="ProfileScreen" 
            component={ProfileScreen} 
            options={({ navigation }) => ({
              title: 'Perfil',
              headerRight: () => (
                <TouchableOpacity onPress={() => handleLogout(navigation)} style={{ marginRight: 15 }}>
                  <Icon name="log-out" size={24} color="#007BFF" />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen 
            name="PointsTableScreen" 
            component={PointsTableScreen} 
            options={{ title: 'Pontos Batidos' }} 
          />
          <Stack.Screen 
            name="PointConfirmationScreen" 
            component={PointConfirmationScreen} 
            options={{ title: 'Confirmar Ponto' }} 
          />
        </Stack.Navigator>
      </PointsProvider>
    </NavigationContainer>
  );
}
