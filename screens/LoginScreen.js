import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button, Alert, Image } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (name && password) {
      navigation.navigate('Profile', { name });
    } else {
      Alert.alert('Login', 'Por favor, insira seu nome e senha.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/favicon-vivon.png')} style={styles.logo} />
      
      
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
      
      <Button title="Entrar" style={styles.buttonLogin} onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5', // Fundo suave para destacar os campos
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
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  logo: {
    width: 120, // Aumenta a largura
    height: 118, // Aumenta a altura
    alignSelf: 'center',
    marginBottom: 40,
},
  buttonLogin: {
    borderRadius: 15,
  }
});
