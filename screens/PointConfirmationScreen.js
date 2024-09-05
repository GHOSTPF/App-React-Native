import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import NetInfo from '@react-native-community/netinfo';
import { api } from '../services/api';
import { usePoints } from './PointsProvider';

export default function PointConfirmationScreen({ route, navigation }) {
    const { email } = route.params;
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [isConnected, setIsConnected] = useState(true);
    const { points, setPoints } = usePoints();

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão negada', 'É necessário permitir o uso da localização para registrar o ponto.');
                return;
            }

            const locationWatch = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 10000,
                    distanceInterval: 50,
                },
                (loc) => {
                    setLocation(loc);
                    updateAddress(loc);
                }
            );

            const updateAddress = async (loc) => {
                const [reverseGeocode] = await Location.reverseGeocodeAsync({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });

                const currentAddress = `${reverseGeocode.street}, ${reverseGeocode.streetNumber || ''}`;
                setAddress(currentAddress);

                const currentDateTime = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                setDateTime(currentDateTime);
            };

            const loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
            updateAddress(loc);

            const netInfo = await NetInfo.fetch();
            setIsConnected(netInfo.isConnected);

            return () => locationWatch.remove();
        })();
    }, []);

    const syncPoints = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                Alert.alert('Erro', 'Token de autenticação não encontrado.');
                return;
            }

            const storedPoints = await AsyncStorage.getItem('offlinePoints');
            const pointsToSync = storedPoints ? JSON.parse(storedPoints) : [];

            if (pointsToSync.length > 0) {
                for (const point of pointsToSync) {
                    const brandData = {
                        email: point.email,
                        horario: point.dateTime,
                        local: point.address
                    };

                    await api.post('/brands', {
                        brand: JSON.stringify(brandData)
                    }, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                }

                await AsyncStorage.removeItem('offlinePoints');
                Alert.alert('Sucesso', 'Todos os pontos foram sincronizados com sucesso!');
            }
        } catch (error) {
            console.error("Erro ao sincronizar pontos:", error.response ? error.response.data : error.message);
            Alert.alert('Erro', 'Não foi possível sincronizar os pontos.');
        }
    };

    const handleRegistration = async () => {
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
                const newPoint = { email, dateTime, address };

                const storedPoints = await AsyncStorage.getItem('offlinePoints');
                const prevPoints = storedPoints ? JSON.parse(storedPoints) : [];
                const updatedPoints = [...prevPoints, newPoint];
                await AsyncStorage.setItem('offlinePoints', JSON.stringify(updatedPoints));
                await AsyncStorage.setItem('timeStamp', dateTime);

                if (isConnected) {
                    await syncPoints();
                    setPoints(prevPoints => [...prevPoints, newPoint]); // Atualiza os pontos no contexto
                    navigation.navigate('PointsTableScreen', { refresh: true });  // Redireciona com sinal de atualização
                } else {
                    Alert.alert('Ponto Registrado', 'Ponto registrado localmente. Será sincronizado quando a internet estiver disponível.');
                    setPoints(prevPoints => [...prevPoints, newPoint]); // Atualiza os pontos no contexto
                    navigation.navigate('PointsTableScreen', { refresh: true });  // Redireciona com sinal de atualização
                }
            } else {
                Alert.alert('Erro', 'Falha na autenticação biométrica.');
            }
        } catch (error) {
            console.error("Erro ao registrar ponto:", error.response ? error.response.data : error.message);
            Alert.alert('Erro', 'Não foi possível registrar o ponto. Por favor, tente novamente.');
        }
    };

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected) {
                syncPoints();
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.email}>{email}</Text>
            <Text style={styles.label}>Data e Hora:</Text>
            <Text style={styles.value}>{dateTime}</Text>

            {location && (
                <>
                    <Text style={styles.label}>Localização:</Text>
                    <Text style={styles.value}>{address}</Text>
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
                        />
                    </MapView>
                </>
            )}

            <TouchableOpacity style={styles.registerButton} onPress={handleRegistration}>
                <Text style={styles.buttonText}>Confirmar Registro</Text>
            </TouchableOpacity>
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
    email: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    value: {
        fontSize: 16,
        marginBottom: 10,
    },
    map: {
        width: '100%',
        height: 200,
        marginTop: 10,
        borderRadius: 10,
    },
    registerButton: {
        marginTop: 20,
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});
