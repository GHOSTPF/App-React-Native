import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Image, ActionSheetIOS, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePoints } from './PointsProvider';
import Icon from 'react-native-vector-icons/Feather';

export default function ProfileScreen({ route, navigation }) {
  const { name, email } = route.params || { name: 'Nome padrão', email: 'email@exemplo.com' };
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');
  const { points, setPoints } = usePoints();

  useEffect(() => {
    async function loadData() {
      try {
        const storedTimeStamp = await AsyncStorage.getItem('timeStamp');
        if (storedTimeStamp) {
          // Usar os dados carregados conforme necessário
        }
      } catch (error) {
        console.error("Failed to load timeStamp", error);
      }
    }
    loadData();
  }, []);

  function handleRegisterPoint() {
    navigation.navigate('PointConfirmationScreen', { email });  // Passando o email ao navegar
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
      <View style={styles.profileCard}>
        <TouchableOpacity onPress={openActionSheet}>
          <Image
            style={styles.profileImage}
            source={{ uri: profileImage }}
          />
        </TouchableOpacity>
        <Text style={styles.welcomeText}>Olá,</Text>
        <Text style={styles.userEmail}>{email}</Text>
      </View>

      <View style={styles.actionButtons}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.roundButton} onPress={handleRegisterPoint}>
            <Icon name="clock" size={20} color='white' />
          </TouchableOpacity>
          <Text style={styles.buttonText}>Registrar Ponto</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.roundButton} onPress={() => navigation.navigate('PointsTableScreen')}>
            <Icon name="calendar" size={20} color='white' />
          </TouchableOpacity>
          <Text style={styles.buttonText}>Pontos Batidos</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.disabledButton}>
          <Icon name="home" style={styles.footerIcon} />
          <Text style={styles.footerText}>Home</Text>
        </View>
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
  },
  welcomeText: {
    fontSize: 18,
    color: '#333',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
    marginTop: 10,
  },
  userEmail: {
    fontSize: 14,
    color: '#555',
    
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  roundButton: {
    backgroundColor: '#007BFF',
    borderRadius: 50,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  buttonText: {
    marginTop: 5,
    color: 'black',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#007BFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  disabledButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerIcon: {
    fontSize: 25,
    color: 'white',
  },
  footerText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
});
