import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { usePoints } from './PointsProvider';
import { api } from '../services/api';

export default function PointConfirmationScreen({ route, navigation }) {
    const { email } = route.params;
    const { addPoint } = usePoints();
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState('');
    const [dateTime, setDateTime] = useState('');

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão negada', 'É necessário permitir o uso da localização para registrar o ponto.');
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);

            const [reverseGeocode] = await Location.reverseGeocodeAsync({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });

            const currentAddress = `${reverseGeocode.street}, ${reverseGeocode.streetNumber || ''}`;
            setAddress(currentAddress);

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
                const newPoint = { email, dateTime, address };

                // Adiciona o ponto localmente
                addPoint(newPoint);
                const storedPoints = await AsyncStorage.getItem('points');
                const prevPoints = storedPoints ? JSON.parse(storedPoints) : [];
                const updatedPoints = [...prevPoints, newPoint];
                await AsyncStorage.setItem('points', JSON.stringify(updatedPoints));
                await AsyncStorage.setItem('timeStamp', dateTime);

                // Recupera o token armazenado corretamente
                const token = await AsyncStorage.getItem('authToken');
                
                if (!token) {
                    Alert.alert('Erro', 'Token de autenticação não encontrado.');
                    return;
                }

                console.log("Token utilizado na requisição:", token);

                // Envia os dados para a API com o token no cabeçalho
                const response = await api.post('/brands', {
                    brand: email, // Ajuste para enviar o dado correto no campo `brand`
                    horario: dateTime,
                    local: address,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (response.status === 200) {
                    Alert.alert('Sucesso', 'Ponto registrado com sucesso!');
                    navigation.goBack();
                } else {
                    Alert.alert('Erro', 'Não foi possível registrar o ponto. Por favor, tente novamente.');
                }
            } else {
                Alert.alert('Erro', 'Falha na autenticação biométrica.');
            }
        } catch (error) {
            console.error("Erro ao registrar ponto:", error.response ? error.response.data : error.message);
            Alert.alert('Erro', `Ocorreu um erro ao tentar registrar o ponto. Status: ${error.response ? error.response.status : 'Desconhecido'} - ${error.message}`);
        }
    }

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
