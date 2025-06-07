const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const redis = require('redis');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configurações de conexão
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://database:27017/fullstack-app';
const REDIS_URL = process.env.REDIS_URL || 'redis://cache:6379';

let db;
let redisClient;

// Conectar ao MongoDB
async function connectMongoDB() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db();
        console.log('Conectado ao MongoDB');
    } catch (error) {
        console.error('Erro ao conectar MongoDB:', error);
        setTimeout(connectMongoDB, 5000); // Tentar reconectar após 5s
    }
}

// Conectar ao Redis
async function connectRedis() {
    try {
        redisClient = redis.createClient({ url: REDIS_URL });
        redisClient.on('error', (err) => console.log('Redis Client Error', err));
        await redisClient.connect();
        console.log('Conectado ao Redis');
    } catch (error) {
        console.error('Erro ao conectar Redis:', error);
        setTimeout(connectRedis, 5000); // Tentar reconectar após 5s
    }
}

// Rotas da API

// GET /api/items - Listar todos os itens
app.get('/api/items', async (req, res) => {
    try {
        // Verificar se existe no cache
        const cacheKey = 'all_items';
        let items;

        if (redisClient) {
            try {
                const cachedItems = await redisClient.get(cacheKey);
                if (cachedItems) {
                    console.log('Dados recuperados do cache');
                    return res.json(JSON.parse(cachedItems));
                }
            } catch (cacheError) {
                console.log('Erro no cache, buscando no banco:', cacheError);
            }
        }

        // Buscar no banco de dados
        items = await db.collection('items').find({}).sort({ createdAt: -1 }).toArray();

        // Armazenar no cache por 5 minutos
        if (redisClient) {
            try {
                await redisClient.setEx(cacheKey, 300, JSON.stringify(items));
                console.log('Dados armazenados no cache');
            } catch (cacheError) {
                console.log('Erro ao armazenar no cache:', cacheError);
            }
        }

        res.json(items);
    } catch (error) {
        console.error('Erro ao buscar itens:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// POST /api/items - Criar novo item
app.post('/api/items', async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ error: 'Nome e descrição são obrigatórios' });
        }

        const newItem = {
            name,
            description,
            createdAt: new Date()
        };

        const result = await db.collection('items').insertOne(newItem);

        // Limpar cache para forçar atualização
        if (redisClient) {
            try {
                await redisClient.del('all_items');
                console.log('Cache limpo após inserção');
            } catch (cacheError) {
                console.log('Erro ao limpar cache:', cacheError);
            }
        }

        res.status(201).json({
            ...newItem,
            _id: result.insertedId
        });
    } catch (error) {
        console.error('Erro ao criar item:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// GET /api/cache-status - Verificar status do cache
app.get('/api/cache-status', async (req, res) => {
    try {
        let cacheInfo = {
            connected: false,
            keys: 0
        };

        if (redisClient) {
            try {
                await redisClient.ping();
                cacheInfo.connected = true;

                // Contar chaves (simplificado)
                const keys = await redisClient.keys('*');
                cacheInfo.keys = keys.length;
            } catch (error) {
                console.log('Erro ao verificar Redis:', error);
            }
        }

        res.json(cacheInfo);
    } catch (error) {
        console.error('Erro ao verificar cache:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        mongodb: !!db,
        redis: !!redisClient,
        timestamp: new Date().toISOString()
    });
});

//DELETE - Deletar um item
app.delete('/api/items/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Deleta o item da coleção usando o ID
        const result = await db.collection('items').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Item não encontrado' });
        }

        // Limpar cache para forçar atualização 
        if (redisClient) {
            try {
                await redisClient.del('all_items'); // 
                console.log('Cache limpo após exclusão');
            } catch (cacheError) {
                console.log('Erro ao limpar cache:', cacheError);
            }
        }

        res.status(200).json({ message: 'Item removido com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar item:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Inicializar conexões e servidor
async function startServer() {
    await connectMongoDB();
    await connectRedis();

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Backend server running on port ${PORT}`);
    });
}

startServer();
