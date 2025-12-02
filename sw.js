const CACHE_NAME = 'sheiko-app-v3.0'; // ATENÇÃO: Mudei o nome para forçar a limpeza do cache antigo
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  // Adicione o icon-512.png aqui APENAS se ele realmente existir na pasta, senão pode dar erro
  // './icon-512.png', 
  
  // Bibliotecas Essenciais (Incluindo as novas do gráfico que faltavam)
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&display=swap',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js', // Adicionado
  'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0'        // Adicionado
];

// 1. Instalação: Baixa os arquivos para o cache
self.addEventListener('install', (event) => {
  // Força o novo Service Worker a assumir o controle imediatamente, sem esperar o usuário fechar o app
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all: app shell and content');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Ativação: Limpa caches antigos (Zumbis)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          // Se o nome do cache for diferente da versão atual (v3.0), apaga ele
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      // Garante que o SW controle todas as abas/janelas abertas agora
      return self.clients.claim();
    })
  );
});

// 3. Interceptação: Estratégia Cache First, falling back to Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna do cache se existir
      if (response) {
        return response;
      }
      
      // Se não existir no cache, busca na rede
      return fetch(event.request).catch(() => {
        // Opcional: Se falhar (offline e sem cache), poderia retornar uma página de fallback
        // return caches.match('./offline.html');
        console.log('Falha ao buscar recurso e sem cache:', event.request.url);
      });
    })
  );
});