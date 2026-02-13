import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
    const [status, setStatus] = useState('Aguardando teste...');

    const testConnection = async () => {
        setStatus('Conectando...');
        try {
            // Nota: Emulaadores Android usam 10.0.2.2 para localhost do PC
            // Em dispositivo físico, use o IP da sua máquina (ex: 192.168.x.x)
            const response = await fetch('http://10.0.2.2:8000/');
            const data = await response.json();
            setStatus('Sucesso: ' + data.message);
        } catch (error) {
            setStatus('Erro: ' + error.message);
            Alert.alert('Erro de Conexão', 'Certifique-se que o backend está rodando.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sistema G.T Mobile</Text>
            <View style={styles.card}>
                <Text style={styles.label}>Status do Backend:</Text>
                <Text style={styles.status}>{status}</Text>
                <Button title="Testar Conexão" onPress={testConnection} />
            </View>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    card: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    status: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
        marginBottom: 20,
        textAlign: 'center',
    },
});
