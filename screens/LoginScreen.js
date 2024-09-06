import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, Image } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { api } from '../services/api';  // Ajuste o caminho conforme necessário
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isConnected, setIsConnected] = useState(true);

  // Função para sincronizar pontos offline
  const syncPoints = async () => {
    try {
      const offlinePoints = await getOfflinePoints();
      for (const point of offlinePoints) {
        await api.post('/brands', point);  // Ajuste para o endpoint correto da API
      }
      await clearOfflinePoints();
    } catch (error) {
      console.error("Erro ao sincronizar pontos:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncPoints();  // Sincronizar pontos se a conexão estiver disponível
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (email && password) {
      try {
        const response = await api.post('/login', { email, password }, {
          headers: { 'Content-Type': 'application/json' }
        });
  
        if (response.status === 200) {
          const { token, user, user_id } = response.data.data;
  
          if (token) {
            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('userName', user);
            await AsyncStorage.setItem('userId', user_id.toString());
  
            // Adicione o console.log para exibir o token
            console.log('Token recebido:', token);
  
            const isBiometricSupported = await LocalAuthentication.hasHardwareAsync();
            const isBiometricEnrolled = await LocalAuthentication.isEnrolledAsync();
  
            if (isBiometricSupported && isBiometricEnrolled) {
              const auth = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Login com Biometria',
              });
  
              if (auth.success) {
                navigation.navigate('ProfileScreen', { email });
              } else {
                Alert.alert('Login', 'Autenticação biométrica falhou.');
              }
            } else {
              navigation.navigate('ProfileScreen', { email });
            }
          } else {
            Alert.alert('Login', 'Token não recebido. Verifique a resposta da API.');
          }
        } else {
          Alert.alert('Login', `Erro: ${response.status} - ${response.statusText}`);
        }
      } catch (error) {
        console.error("Erro na requisição:", error.response ? error.response.data : error.message);
        Alert.alert('Erro', `Erro ao fazer login. Status: ${error.response ? error.response.status : 'Desconhecido'} - ${error.message}`);
      }
    } else {
      Alert.alert('Login', 'Por favor, insira seu email e senha.');
    }
  };
  

  return (
    <View style={styles.container}>
      <Image source={require('../assets/vivon-native1.gif')} style={styles.logo} />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#A9A9A9"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#A9A9A9"
        />
      </View>
      
      <TouchableOpacity style={styles.buttonLogin} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  logo: {
    width: 180,
    height: 118,
    alignSelf: 'center',
    marginBottom: 40,
  },
  buttonLogin: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerText: {
    marginTop: 20,
    color: '#007BFF',
    textAlign: 'center',
  },
});

// Funções para gerenciar pontos offline
const saveOfflinePoint = async (point) => {
  try {
    const existingPoints = await AsyncStorage.getItem('offlinePoints');
    const points = existingPoints ? JSON.parse(existingPoints) : [];

    points.push(point);

    await AsyncStorage.setItem('offlinePoints', JSON.stringify(points));
  } catch (error) {
    console.error("Erro ao salvar ponto offline:", error);
  }
};

const getOfflinePoints = async () => {
  try {
    const points = await AsyncStorage.getItem('offlinePoints');
    return points ? JSON.parse(points) : [];
  } catch (error) {
    console.error("Erro ao obter pontos offline:", error);
    return [];
  }
};

const clearOfflinePoints = async () => {
  try {
    await AsyncStorage.removeItem('offlinePoints');
  } catch (error) {
    console.error("Erro ao limpar pontos offline:", error);
  }
};
