import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { usePoints } from './PointsProvider'; 

export default function PointsTableScreen({ route }) {
  const { points } = usePoints(); // Usando o contexto para obter os pontos

  const parsePoint = (point) => {
    // Divide a string no "bateu o ponto às" e "no dia"
    const [namePart, rest] = point.split(' bateu o ponto às ');
    const [timePart, datePart] = rest.split(' no dia ');

    return {
      name: namePart, // Nome da pessoa
      time: timePart, // Horário com AM/PM
      date: datePart, // Dia
    };
  };

  const parsedPoints = points.map(parsePoint);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tabela de Pontos</Text>
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>Pessoa</Text>
        <Text style={styles.headerCell}>Horário</Text>
        <Text style={styles.headerCell}>Dia</Text>
      </View>
      <FlatList
        data={parsedPoints}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={styles.cell}>{item.name}</Text>
            <Text style={styles.cell}>{item.time}</Text>
            <Text style={styles.cell}>{item.date}</Text>
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
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 8,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
