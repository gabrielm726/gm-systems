# Plano de Migração: Mock -> Supabase Real

**Objetivo:** Conectar o sistema (que atualmente roda com dados falsos/memória) ao banco de dados real Supabase.

## Estado Atual
- O sistema usa `setTimeout` para simular carregamento.
- Os dados (Ativos, Usuários) não estão sendo salvos em lugar nenhum (apenas na memória RAM do navegador).
- Não existe biblioteca do Supabase instalada.

## Mudanças Necessárias

### 1. Instalação de Dependências
- Instalar `@supabase/supabase-js`.

### 2. Configuração do Cliente Supabase
- Criar arquivo `constants.tsx` ou `services/supabase.ts` com a inicialização:
  ```typescript
  import { createClient } from '@supabase/supabase-js'
  const supabaseUrl = 'https://YOUR_PROJECT.supabase.co'
  const supabaseKey = 'YOUR_ANON_KEY'
  export const supabase = createClient(supabaseUrl, supabaseKey)
  ```
  *(Precisarei pedir ao usuário a URL e a KEY do projeto Supabase dele, ou ele preencher depois)*.

### 3. Refatoração do `App.tsx` (O "Cérebro")
- **Login:**
  - Substituir `onLogin` falso por `supabase.auth.signInWithPassword`.
  - Usar `useEffect` para checar `supabase.auth.getSession`.
- **Carregamento de Dados:**
  - Substituir o array `initialAssets` por `supabase.from('assets').select('*')`.
  - Substituir o array `initialLocations` por `supabase.from('locations').select('*')`.
- **Ações (CRUD):**
  - **Criar Ativo:** `supabase.from('assets').insert(asset)`.
  - **Atualizar Ativo:** `supabase.from('assets').update(asset).eq('id', id)`.
  - **Deletar Ativo:** `supabase.from('assets').delete().eq('id', id)`.

### 4. Build e Produção
- O `LANCAR_NOVA_VERSAO.bat` continuará funcionando, mas não precisará mais do Python. O app final será 100% autônomo.

## Verificação
1. Login real: Se errar a senha, o Supabase rejeita.
2. Persistência: Criar um ativo, fechar o app, abrir de novo. O ativo deve estar lá.
3. Multi-tenancy: O RLS do banco garantirá a segurança automaticamente.
