import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { usePoints } from './PointsProvider';

export default function PointsTableScreen() {
  const { points } = usePoints();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tabela de Pontos</Text>
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>Pessoa</Text>
        <Text style={styles.headerCell}>Horário</Text>
        <Text style={styles.headerCell}>Local</Text>
      </View>
      <FlatList
        data={points}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={styles.cell}>{item.name}</Text>
            <Text style={styles.cell}>{item.dateTime}</Text>
            <Text style={styles.cell}>{item.address}</Text>
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
