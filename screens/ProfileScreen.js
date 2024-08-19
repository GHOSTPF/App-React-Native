import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Image, ActionSheetIOS, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import * as LocalAuthentication from 'expo-local-authentication';

export default function ProfileScreen({ route, navigation }) {
  const { name } = route.params;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [timeStamp, setTimeStamp] = useState(null);
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');

  async function handleAuthentication() {
    const isBiometricEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isBiometricEnrolled) {
      return Alert.alert('Login', 'Nenhuma biometria encontrada. Por favor, cadastre uma biometria no dispositivo.');
    }

    const auth = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Login com Biometria',
      fallbackLabel: 'Biometria não reconhecida',
    });

    if (auth.success) {
      setIsAuthenticated(true);
      const currentTime = new Date().toLocaleTimeString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour12: true,
      });
      const currentDate = new Date().toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      });
      setTimeStamp(`${name} bateu o ponto às ${currentTime} no dia ${currentDate}`);
    }
  }

  async function selectImageFromGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } else {
      Alert.alert('Permissão negada', 'É necessário permitir o uso da câmera para tirar fotos.');
    }
  }

  function openActionSheet() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Escolher da Galeria', 'Tirar Foto'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            selectImageFromGallery();
          } else if (buttonIndex === 2) {
            takePhoto();
          }
        }
      );
    } else {
      Alert.alert(
        'Selecionar Imagem',
        'Escolha uma opção',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Escolher da Galeria', onPress: selectImageFromGallery },
          { text: 'Tirar Foto', onPress: takePhoto },
        ]
      );
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <TouchableOpacity onPress={openActionSheet}>
        <Image
          style={styles.image}
          source={{ uri: profileImage }}
        />
      </TouchableOpacity>
      <Text style={styles.name}>Nome: {name}</Text>
      <TouchableOpacity style={styles.button} onPress={handleAuthentication}>
        <Text style={styles.buttonText}>MARCAR PONTO COM BIOMETRIA</Text>
      </TouchableOpacity>
      {isAuthenticated && <Text style={styles.timeStamp}>{timeStamp}</Text>}

      {/* Botão para navegar para a tela de pontos */}
      <TouchableOpacity
        style={[styles.button, { marginTop: 20 }]}
        onPress={() => navigation.navigate('PointsTable')}
      >
        <Text style={styles.buttonText}>VER PONTOS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#007BFF',
  },
  name: {
    fontSize: 20,
    color: '#666',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timeStamp: {
    marginTop: 24,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});
