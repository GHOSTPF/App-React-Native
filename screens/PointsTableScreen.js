import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePoints } from './PointsProvider'; // Importa o hook

export default function PointsTableScreen({ route }) {
  const { name } = route.params || { name: 'Nome padrão' };
  const [points, setPoints] = useState([]);
  
  useEffect(() => {
    async function loadPoints() {
      const storedPoints = await AsyncStorage.getItem('points');
      if (storedPoints) {
        setPoints(JSON.parse(storedPoints));
      } else if (route.params?.timeStamp) {
        const newPoints = [route.params.timeStamp];
        setPoints(newPoints);
        await AsyncStorage.setItem('points', JSON.stringify(newPoints));
      }
    }
    loadPoints();
  }, [route.params]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tabela de Pontos</Text>
      <FlatList
        data={points}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum ponto marcado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    padding: 12,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});