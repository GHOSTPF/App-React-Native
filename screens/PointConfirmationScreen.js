import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { usePoints } from './PointsProvider';

export default function PointConfirmationScreen({ route, navigation }) {
    const { name } = route.params;
    const { addPoint } = usePoints();
    const { setPoints } = usePoints();
    const [location, setLocation] = useState(null);
    const [dateTime, setDateTime] = useState('');

    const handleConfirmPoint = () => {
        const newPoint = {
          name,
          time: new Date().toLocaleTimeString(),
          day: new Date().toLocaleDateString(),
        };
    
        try {
          addPoint(newPoint);
          navigation.navigate('PointsTableScreen');
        } catch (error) {
          console.error("Failed to authenticate or register point", error);
        }
      };
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão negada', 'É necessário permitir o uso da localização para registrar o ponto.');
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
            const currentDateTime = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
            setDateTime(currentDateTime);
        })();
    }, []);

    async function handleRegistration() {
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
                const address = location 
                    ? `Lat: ${location.coords.latitude}, Lon: ${location.coords.longitude}` 
                    : 'Localização não disponível';

                const newPoint = { name, dateTime, address };

                setPoints(prevPoints => [...prevPoints, newPoint]);
                await AsyncStorage.setItem('points', JSON.stringify([...prevPoints, newPoint]));

                navigation.navigate('PointsTableScreen');
            }
        } catch (error) {
            console.error("Failed to authenticate or register point", error);
            Alert.alert('Erro', 'Não foi possível registrar o ponto. Por favor, tente novamente.');
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Confirmação de Ponto</Text>
            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>Nome: {name || 'Nome não disponível'}</Text>
                <Text style={styles.infoText}>Data e Hora: {dateTime || 'Data e Hora não disponíveis'}</Text>
                <Text style={styles.infoText}>Local: {location 
                    ? `Lat: ${location.coords.latitude}, Lon: ${location.coords.longitude}` 
                    : 'Localização não disponível'}</Text>
            </View>
            {location && (
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    }}>
                    <Marker
                        coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        }}
                        title={'Sua Localização'}
                    />
                </MapView>
            )}
            <Button title="Registrar Ponto" onPress={handleRegistration} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    infoContainer: {
        marginBottom: 30,
    },
    infoText: {
        fontSize: 18,
        marginBottom: 10,
    },
    map: {
        width: '100%',
        height: 200,
        marginBottom: 20,
    },
});
