import { API_URL } from '../../constants';

// AuthService.ts
// Abstract authentication logic and token storage.
// This allows us to easily switch to SecureStorage/cookies in the future.

export const AuthService = {
    // 1. Token Management
    setToken: (token: string) => {
        // TODO: Upgrade to SecureStorage for Mobile/Electron
        localStorage.setItem('auth_token', token);
    },

    getToken: (): string | null => {
        return localStorage.getItem('auth_token');
    },

    clearToken: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
    },

    logout: () => {
        AuthService.clearToken();
    },

    // 2. User Data Management
    setUser: (user: any) => {
        localStorage.setItem('user_data', JSON.stringify(user));
    },

    getUser: (): any | null => {
        const data = localStorage.getItem('user_data');
        return data ? JSON.parse(data) : null;
    },

    // 3. API Helpers
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('auth_token');
    },

    // 4. Offline Auth (SQLite)
    saveSessionOffline: async (user: any, token: string, passwordPlain: string) => {
        try {
            // Lazy load bcrypt to avoid import errors if not needed immediately
            const bcrypt = await import('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(passwordPlain, salt); // Hash para validar offline

            // Lazy load dbService
            const { dbService } = await import('./DatabaseService');

            await dbService.execute(`
                DELETE FROM user_session; -- Manter apenas um usuário por segurança/simplicidade por enquanto
            `);

            await dbService.query(`
                INSERT INTO user_session (user_id, nome, email, role, password_hash, token, prefeitura_id, avatar_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [user.id, user.nome, user.email, user.role, hash, token, user.client_id, user.avatarUrl || '']);

            console.log('📦 Sessão salva offline com sucesso.');
        } catch (e) {
            console.error('Falha ao salvar sessão offline:', e);
        }
    },

    loginOffline: async (email: string, passwordPlain: string) => {
        try {
            const { dbService } = await import('./DatabaseService');
            const bcrypt = await import('bcryptjs');

            const result = await dbService.query('SELECT * FROM user_session WHERE email = ?', [email]);
            if (result.length === 0) return null;

            const session = result[0];

            if (!session.password_hash) return null;

            const isValid = await bcrypt.compare(passwordPlain, session.password_hash);
            if (isValid) {
                return {
                    id: session.user_id,
                    nome: session.nome,
                    email: session.email,
                    role: session.role,
                    client_id: session.prefeitura_id,
                    status: 'ATIVO',
                    token: session.token,
                    avatarUrl: session.avatar_url || ''
                };
            }
        } catch (e) {
            console.error('Erro no login offline:', e);
        }
        return null;
    },

    login: async (email: string, password: string) => {
        try {
            // 1. Try VERCEL CLOUD API Login (Proprietary Backend)
            // Fixes "Invalid Signature" error by using the same secret as the backend.
            console.log(`🌐 Connecting to Cloud API (${API_URL}/auth/login)...`);

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Login falhou no servidor.');
            }

            const apiUser = data.user;
            const token = data.token; // This token is signed by Vercel's JWT_SECRET

            if (apiUser) {
                const user = {
                    id: apiUser.id,
                    email: apiUser.email,
                    nome: apiUser.name || apiUser.email.split('@')[0],
                    role: apiUser.role || 'VIEWER',
                    token: token,
                    status: apiUser.status || 'ACTIVE',
                    client_id: apiUser.client_id || 'DEFAULT',
                    avatarUrl: apiUser.avatar_url || ''
                };

                AuthService.setUser(user);
                AuthService.setToken(user.token);
                await AuthService.saveSessionOffline(user, user.token, password);
                return user;
            }
        } catch (cloudError: any) {
            console.warn('⚠️ Cloud Login Failed:', cloudError);
            throw cloudError;
        }
    }
};
