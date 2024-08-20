import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (name && password) {
      const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync();
      const isBiometricEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!isBiometricAvailable) {
        return Alert.alert('Erro', 'Seu dispositivo não suporta biometria.');
      }

      if (!isBiometricEnrolled) {
        return Alert.alert('Erro', 'Por favor, cadastre uma biometria no dispositivo.');
      }

      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Registrar Biometria',
        cancelLabel: 'Cancelar',
      });

      if (auth.success) {
        const user = { name, password };
        await AsyncStorage.setItem('user', JSON.stringify(user));
        Alert.alert('Registro', 'Conta criada com sucesso!');
        navigation.navigate('Login');
      } else {
        Alert.alert('Erro', 'Falha ao registrar biometria. Tente novamente.');
      }
    } else {
      Alert.alert('Registro', 'Por favor, insira seu nome e senha.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={name}
          onChangeText={setName}
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
      <Button title="Registrar" onPress={handleRegister} />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
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
});
