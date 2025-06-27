# Formulário com Docker

Uma aplicação fullstack conteinerizada demonstrando a integração entre Frontend, Backend, MongoDB e Redis usando Docker Compose.


## Arquitetura

Este projeto implementa uma aplicação fullstack com os seguintes serviços:

- **Frontend**: Servidor Node.js para arquivos estáticos (porta 3000)
- **Backend**: API REST Node.js/Express (porta 5000)
- **MongoDB**: Banco de dados NoSQL (porta 27017)
- **Redis**: Sistema de cache em memória (porta 6379)

Todos os serviços operam na rede customizada `app-network` para comunicação entre containers.

## Estrutura do Projeto

```text
TrabalhoDocker/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── public/
│       ├── index.html
│       ├── style.css
│       └── script.js
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
└── README.md
```
## Como Executar

### Pré-requisitos
- Docker
- Docker Compose

### Inicialização
```bash
# Clone o repositório
git clone https://github.com/angelollima/TrabalhoDocker.git
cd TrabalhoDocker

# Construir e iniciar todos os serviços
docker compose up --build

# Ou executar em background
docker compose up --build -d
```

A aplicação estará disponível em:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Persistência de Dados

Os dados do MongoDB são persistidos através de um volume Docker:
- **Volume**: `./data/mongodb:/data/db`
- Os dados permanecem salvos mesmo após reinicialização dos containers

## Testando a Aplicação

### Interface Web
Acesse http://localhost:3000 para:
- Adicionar novos itens via formulário
- Listar itens salvos no MongoDB
- Remover itens existentes
- Verificar status do cache Redis

### Testando API via cURL

**Listar todos os itens:**
```bash
curl http://localhost:5000/api/items
```

**Criar novo item:**
```bash
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","description":"Item de teste"}'
```

**Verificar status do cache:**
```bash
curl http://localhost:5000/api/cache-status
```

**Health check da API:**
```bash
curl http://localhost:5000/health
```

**Remover item:**
```bash
curl -X DELETE http://localhost:5000/api/items/ID_DO_ITEM
```

## Comandos Docker Úteis

### Gerenciamento de Containers
```bash
# Construir imagens
docker compose build

# Construir sem cache
docker compose build --no-cache

# Subir serviços
docker compose up

# Subir um serviço específico
docker compose up nome-do-servico

# Parar serviços
docker compose stop

# Reiniciar serviços
docker compose restart

# Parar e remover containers
docker compose down

# Remover containers e volumes
docker compose down -v
```

### Monitoramento
```bash
# Listar containers ativos
docker ps

# Ver logs em tempo real
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs nome-do-servico
```

## Rede Docker

Os containers utilizam uma rede customizada `app-network` (tipo bridge) que permite comunicação através dos nomes de serviço.

### Configuração de Rede Personalizada

Para garantir um nome fixo da rede:

```bash
# Criar rede manualmente
docker network create app-network
```

E no `docker-compose.yml`:
```yaml
networks:
  app-network:
    external: true
```

Ou definir nome do projeto:
```bash
docker compose -p meu-projeto up
```

## Ordem de Inicialização

O Docker Compose garante a seguinte ordem através de `depends_on`:
1. MongoDB (database)
2. Redis (cache)
3. Backend (backend)
4. Frontend (frontend)

## Funcionalidades

- **CRUD completo** de itens via API REST
- **Interface web intuitiva** para gerenciamento
- **Cache Redis** para otimização de performance
- **Persistência** de dados com MongoDB
- **Containerização completa** com Docker
- **Rede isolada** para comunicação entre serviços

## Tecnologias

- **Frontend**: HTML, CSS, JavaScript, Node.js
- **Backend**: Node.js, Express.js
- **Banco de Dados**: MongoDB
- **Cache**: Redis
- **Containerização**: Docker, Docker Compose

## Licença
Este projeto foi desenvolvido para fins educacionais.
