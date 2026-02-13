# Sistema G.T Gestão Patrimonial - Java Version

Este é o Sistema G.T Gestão Patrimonial convertido para Java, mantendo todas as funcionalidades do sistema original React/TypeScript/Electron.

## Arquitetura

O sistema foi convertido para uma arquitetura modular em Java:

- **Backend**: Spring Boot com REST APIs
- **Web Frontend**: Vaadin Flow para interface web
- **Desktop**: JavaFX para aplicação desktop
- **Database**: PostgreSQL

## Estrutura do Projeto

```
gestao-patrimonial/
├── pom.xml                          # Parent POM
├── backend/                         # Spring Boot backend
│   ├── pom.xml
│   └── src/main/java/com/gt/gestao/backend/
│       ├── model/                   # JPA Entities
│       ├── repository/              # JPA Repositories
│       ├── service/                 # Business Logic
│       ├── controller/              # REST Controllers
│       ├── config/                  # Configuration classes
│       └── security/                # Security configuration
├── web/                             # Vaadin web application
│   ├── pom.xml
│   └── src/main/java/com/gt/gestao/web/
│       └── views/                   # Vaadin views
└── desktop/                         # JavaFX desktop application
    ├── pom.xml
    └── src/main/java/com/gt/gestao/desktop/
        └── views/                   # JavaFX views
```

## Pré-requisitos

- JDK 17 ou superior
- Maven 3.6+
- PostgreSQL 12+

## Configuração do Banco de Dados

1. Instale o PostgreSQL
2. Crie um banco de dados chamado `gestao_patrimonial`
3. Configure as credenciais no arquivo `backend/src/main/resources/application.properties`

## Como Executar

### Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

O backend estará disponível em: http://localhost:8080

### Web Application (Vaadin)

```bash
cd web
mvn spring-boot:run
```

A aplicação web estará disponível em: http://localhost:8080

### Desktop Application (JavaFX)

```bash
cd desktop
mvn javafx:run
```

## Funcionalidades Mantidas

- ✅ Gestão de usuários com roles e permissões
- ✅ Cadastro e gestão de ativos/patrimônio
- ✅ Gestão de fornecedores e custos
- ✅ Controle de localização e depósitos
- ✅ Sistema de manutenção
- ✅ Gestão documental (GED)
- ✅ Relatórios e BI
- ✅ Inventário digital
- ✅ Controle de processos oficiais
- ✅ Governança e compliance
- ✅ Auditoria e logs
- ✅ Interface tab-based mantida

## APIs REST

### Usuários
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `PUT /api/users/{id}` - Atualizar usuário
- `DELETE /api/users/{id}` - Remover usuário

### Ativos
- `GET /api/assets` - Listar ativos
- `POST /api/assets` - Criar ativo
- `PUT /api/assets/{id}` - Atualizar ativo
- `DELETE /api/assets/{id}` - Remover ativo

### Fornecedores
- `GET /api/suppliers` - Listar fornecedores
- `POST /api/suppliers` - Criar fornecedor
- `PUT /api/suppliers/{id}` - Atualizar fornecedor
- `DELETE /api/suppliers/{id}` - Remover fornecedor

## Desenvolvimento

Para contribuir com o desenvolvimento:

1. Clone o repositório
2. Execute `mvn clean install` na raiz do projeto
3. Configure seu IDE para usar JDK 17
4. Execute os módulos individualmente conforme necessário

## Migração de Dados

Para migrar dados do sistema antigo:

1. Exporte os dados do sistema React/TypeScript
2. Use os scripts de migração em `backend/src/main/resources/db/migration/`
3. Execute as migrações antes de iniciar o sistema

## Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento da GT Gestão.
