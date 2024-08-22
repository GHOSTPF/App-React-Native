import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Image, ActionSheetIOS, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePoints } from './PointsProvider'; // Importa o hook
import Icon from 'react-native-vector-icons/FontAwesome';

export default function ProfileScreen({ route, navigation }) {
  const { name } = route.params || { name: 'Nome padrão' };
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');
  const { points, setPoints } = usePoints(); // Usando o contexto

  useEffect(() => {
    async function loadData() {
      try {
        const storedTimeStamp = await AsyncStorage.getItem('timeStamp');
        if (storedTimeStamp) {
          // O uso de setTimeStamp foi removido, pois não está definido
          // Você pode usar os dados carregados conforme necessário
        }
      } catch (error) {
        console.error("Failed to load timeStamp", error);
      }
    }
    loadData();
  }, []);

  async function handleAuthentication() {
    try {
      const isBiometricEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isBiometricEnrolled) {
        return Alert.alert('Login', 'Nenhuma biometria encontrada. Por favor, cadastre uma biometria no dispositivo.');
      }

      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login com Biometria',
        fallbackLabel: 'Biometria não reconhecida',
      });

      if (auth.success) {
        const currentTime = new Date().toLocaleTimeString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          hour12: true,
        });
        const currentDate = new Date().toLocaleDateString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
        });
        const newTimeStamp = `${name} bateu o ponto às ${currentTime} no dia ${currentDate}`;

        setPoints(prevPoints => [...prevPoints, newTimeStamp]);
        await AsyncStorage.setItem('timeStamp', newTimeStamp);
        
        navigation.navigate('PointsTableScreen', { name, timeStamp: newTimeStamp });
      }
    } catch (error) {
      console.error("Failed to authenticate", error);
    }
  }

  async function selectImageFromGallery() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Failed to select image from gallery", error);
    }
  }

  async function takePhoto() {
    try {
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
    } catch (error) {
      console.error("Failed to take photo", error);
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
      {/* Card de Perfil */}
      <View style={styles.profileCard}>
        <TouchableOpacity onPress={openActionSheet}>
          <Image
            style={styles.profileImage}
            source={{ uri: profileImage }}
          />
        </TouchableOpacity>
        <Text style={styles.welcomeText}>Olá,</Text>
        <Text style={styles.userName}>{name}</Text>
      </View>

      <View style={styles.actionButtons}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.roundButton} onPress={handleAuthentication}>
            <Icon name="clock-o" size={20} color='white' />
          </TouchableOpacity>
          <Text style={styles.buttonText}>Registrar Ponto</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.roundButton} onPress={() => navigation.navigate('PointsTableScreen')}>
            <Icon name="calendar" size={20} color='white' />
          </TouchableOpacity>
          <Text style={styles.buttonText}>Batidas do Mês</Text>
        </View>
      </View>

      {/* Footer com ícone de Home */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Icon name="home" style={styles.footerIcon} />
          <Text style={styles.footerText}>Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  profileCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#007BFF',
    marginBottom: 10,
    marginRight: 190,
  },
  welcomeText: {
    fontSize: 18,
    color: '#333',
    marginTop: -100,
  },
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 35,
    color: '#007BFF',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Espaça os botões igualmente
    width: '100%', // Garante que os botões ocupem toda a largura disponível
    paddingHorizontal: 20, // Adiciona espaço nas laterais
  },
  buttonContainer: {
    alignItems: 'center',
  },
  roundButton: {
    backgroundColor: '#007BFF', // Cor azul
    borderRadius: 50,
    padding: 10, // Ajusta o padding para o tamanho desejado
    alignItems: 'center',
    justifyContent: 'center',
    width: 50, // Ajusta a largura para o padding
    height: 50, // Ajusta a altura para o padding
  },
  buttonText: {
    marginTop: 5, // Espaçamento entre o botão e o texto
    color: 'black', // Cor do texto
    fontSize: 12, // Tamanho da fonte
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#007BFF', // Cor de fundo azul
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#0056b3', // Borda superior mais escura
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // Sombra para destaque
  },
  footerIcon: {
    fontSize: 32,
    color: 'white', // Cor do ícone
  },
  footerText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
});
