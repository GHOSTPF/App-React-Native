import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePoints } from './PointsProvider'; // Importe o contexto corretamente

export default function PointConfirmationScreen({ route, navigation }) {
    const { name, dateTime, location } = route.params;
    const { setPoints } = usePoints(); // Usando o contexto

    async function handleRegistration() {
        try {
            // Verifica se a biometria está cadastrada
            const isBiometricEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (!isBiometricEnrolled) {
                return Alert.alert('Login', 'Nenhuma biometria encontrada. Por favor, cadastre uma biometria no dispositivo.');
            }

            // Solicita autenticação biométrica
            const auth = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Login com Biometria',
                fallbackLabel: 'Biometria não reconhecida',
            });

            if (auth.success) {
                // Solicita permissão para acessar a localização
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permissão negada', 'É necessário permitir o uso da localização para registrar o ponto.');
                    return;
                }

                // Obtém a localização do usuário
                const address = location || 'Localização não disponível'; // Utilize o endereço da tela anterior

                // Cria um novo timestamp
                const newTimeStamp = `${name} bateu o ponto às ${dateTime}`;

                // Atualiza o contexto de pontos
                setPoints(prevPoints => [...prevPoints, { name, dateTime, address }]);

                // Salva o timestamp no AsyncStorage
                await AsyncStorage.setItem('timeStamp', newTimeStamp);

                // Navega para a tela de pontos
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
                <Text style={styles.infoText}>Local: {location || 'Localização não disponível'}</Text>
            </View>
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
});
