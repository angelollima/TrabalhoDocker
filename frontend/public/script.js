const API_BASE_URL = 'http://localhost:5000/api';

// Adicionar item
document.getElementById('addForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('itemName').value;
    const description = document.getElementById('itemDescription').value;

    try {
        const response = await fetch(`${API_BASE_URL}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, description })
        });

        if (response.ok) {
            alert('Item adicionado com sucesso!');
            document.getElementById('addForm').reset();
            loadItems(); // Recarregar lista
        } else {
            alert('Erro ao adicionar item');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão');
    }
});

// Carregar itens
document.getElementById('loadItems').addEventListener('click', loadItems);

async function loadItems() {
    try {
        const response = await fetch(`${API_BASE_URL}/items`);
        const items = await response.json();

        const itemsList = document.getElementById('itemsList');
        itemsList.innerHTML = '';

        if (items.length === 0) {
            itemsList.innerHTML = '<p>Nenhum item encontrado.</p>';
            return;
        }

        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.innerHTML = `
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <small>Criado em: ${new Date(item.createdAt).toLocaleString()}</small>
            `;
            itemsList.appendChild(itemDiv);
        });
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('itemsList').innerHTML = '<p class="error">Erro ao carregar itens</p>';
    }
}

// Verificar cache
document.getElementById('checkCache').addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/cache-status`);
        const data = await response.json();

        const cacheStatus = document.getElementById('cacheStatus');
        cacheStatus.innerHTML = `
            <p class="success">Cache conectado: ${data.connected ? 'Sim' : 'Não'}</p>
            <p>Total de chaves: ${data.keys || 0}</p>
            <p>Último acesso: ${new Date().toLocaleString()}</p>
        `;
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('cacheStatus').innerHTML = '<p class="error">Erro ao verificar cache</p>';
    }
});

// Carregar itens na inicialização
window.addEventListener('load', loadItems);
