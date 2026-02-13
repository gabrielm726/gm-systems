/// <reference types="vite/client" />
import { AuthService } from './AuthService';

import { API_URL } from '../../constants';
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const SyncService = {
    async syncBatch(operations: any[]) {
        const token = AuthService.getToken();
        if (!token) throw new Error('Usuário não autenticado');

        const response = await fetch(`${API_URL}/assets/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ operations })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erro na sincronização');
        }

        return await response.json();
    }
};
