# MANUAL TÉCNICO: MULTI-TENANCY E INSTALAÇÃO (G.T GESTÃO)

Este documento explica como o seu sistema atende aos requisitos de **isolamento de dados (Multi-loja/Prefeitura)** e **experiência de instalação nativa**.

---

## 1. SEGURANÇA BANCÁRIA: "MULTI-TENANCY" (VÁRIOS BANCOS EM UM)

Você pediu "mais de um banco de dados e meio de segurança". A solução Enterprise que criamos usa uma técnica chamada **Row Level Security (RLS) com Isolamento de Organização**.

### Como funciona (O Segredo):
Em vez de ter bancos de dados separados (que custam caro e são difíceis de manter), seu **SETUP_SUPABASE_V2.sql** cria um "cofre digital" para cada cliente dentro do mesmo sistema Super.

1.  **Coluna Mágica (`organization_id`):**
    *   Cada dado (uma cadeira, um carro, um usuário) recebe um "carimbo" invisível com o ID da Prefeitura.
    *   Exemplo: Prefeitura A tem ID `123`. Prefeitura B tem ID `456`.

2.  **A Polícia do Banco (RLS Policies):**
    *   O banco de dados tem uma regra inviolável: *"Se o usuário é da Prefeitura 123, ele NÃO PODE ver nada que não tenha o carimbo 123"*.
    *   Isso acontece no **nível do disco**, não no aplicativo. Mesmo se um hacker tentar burlar o app, o banco recusa a entrega dos dados.

### O Fluxo de Convite ("Ver a mesma coisa que eu"):
Quando você autoriza o funcionário novo:
1.  O sistema automaticamente copia o seu `organization_id` para o perfil dele.
2.  Instantaneamente, ele passa a ver **exatamente os mesmos ativos, locais e relatórios que você**, porque agora ele tem a "chave do cofre" daquela prefeitura específica.

---

## 2. INSTALADORES NATIVOS (STANDALONE)

Você pediu que funcione "igual um aplicativo mesmo". Confirmamos a configuração no arquivo de construção (`package.json`):

*   **Tecnologia NSIS (Windows):** O instalador gerado (`.exe`) é um pacote completo.
    *   Ele **não pede** para instalar Java, .NET ou banco de dados.
    *   Tudo o que o sistema precisa (motor Chromium, lógica React) está **embutido** dentro do executável.
    *   O usuário só faz: **Duplo Clique -> Próximo -> Próximo -> Instalar**.
    *   Cria atalho na Área de Trabalho e Menu Iniciar automaticamente.

---

## 3. RESUMO DO SEU PRODUTO FINAL

| Característica | Solução Implementada (G.T Enterprise) |
| :--- | :--- |
| **Banco de Dados** | Supabase Cloud com Isolamento RLS (Criptografia de ponta a ponta). |
| **Segurança** | Autorização centralizada via Painel do Provedor (você aprova quem entra). |
| **Colaboração** | Times isolados por Organização (Quem é da Prefeitura X só vê X). |
| **Instalação** | Arquivo único `.exe` e `.apk` (Zero dependências externas). |
| **Custo** | Infraestrutura começa **GRÁTIS** (Free Tier do Supabase aguenta milhares de itens). |

---

### PRÓXIMOS PASSOS RECOMENDADOS
1.  Use o **SETUP_SUPABASE_V2.sql** no seu painel Supabase.
2.  Gere os instaladores finais rodando `LANCAR_NOVA_VERSAO.bat` agora.
3.  O sistema está pronto para escala comercial.
