var CACHE_VERSION = 'v=2.8.1.1';

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_VERSION).then(function (cache) {
            cache.addAll([
                '/minigame-collection/manifest.json?v=2.8.1.1',
                '/minigame-collection/index.html?v=2.8.1.1',
                '/minigame-collection/style.css?v=2.8.1.1',
                '/minigame-collection/service-worker-registration.js?v=2.8.1.1',
                '/minigame-collection/img/MinigameCollectionFaviconBig.png',
                '/minigame-collection/img/MinigameCollectionFavicon.png',
                '/minigame-collection/img/Housebird Games Logo Round With Name.png',
                '/minigame-collection/music/Chillofun.mp3',
                '/minigame-collection/music/Sleeping and dreaming.mp3',
                '/minigame-collection/src/main.js?v=2.8.1.1',
                '/minigame-collection/src/updateNotes.js?v=2.8.1.1',
                '/minigame-collection/fonts/Oxygen/Oxygen-Bold.ttf',
                '/minigame-collection/fonts/Oxygen/Oxygen-Light.ttf',
                '/minigame-collection/fonts/Oxygen/Oxygen-Regular.ttf',
                '/minigame-collection/games/jump-n-fun/game.js?v=2.8.1.1',
                '/minigame-collection/games/jump-n-fun/style.css?v=2.8.1.1',
                '/minigame-collection/games/jump-n-fun/index.html?v=2.8.1.1',
                '/minigame-collection/games/memory-match/game.js?v=2.8.1.1',
                '/minigame-collection/games/memory-match/index.html?v=2.8.1.1',
                '/minigame-collection/games/memory-match/style.css?v=2.8.1.1',
                '/minigame-collection/games/math-challenge/game.js?v=2.8.1.1',
                '/minigame-collection/games/math-challenge/style.css?v=2.8.1.1',
                '/minigame-collection/games/math-challenge/index.html?v=2.8.1.1',
                '/minigame-collection/games/number-guessing/game.js?v=2.8.1.1',
                '/minigame-collection/games/number-guessing/index.html?v=2.8.1.1',
                '/minigame-collection/games/number-guessing/style.css?v=2.8.1.1',
                '/minigame-collection/games/peaceful-points/game.js?v=2.8.1.1',
                '/minigame-collection/games/peaceful-points/index.html?v=2.8.1.1',
                '/minigame-collection/games/peaceful-points/style.css?v=2.8.1.1',
                '/minigame-collection/games/simon-says/game.js?v=2.8.1.1',
                '/minigame-collection/games/simon-says/index.html?v=2.8.1.1',
                '/minigame-collection/games/simon-says/style.css?v=2.8.1.1',
                '/minigame-collection/games/tic-tac-toe/game.js?v=2.8.1.1',
                '/minigame-collection/games/tic-tac-toe/index.html?v=2.8.1.1',
                '/minigame-collection/games/tic-tac-toe/style.css?v=2.8.1.1',
                '/minigame-collection/games/ten-cards/game.js?v=2.8.1.1',
                '/minigame-collection/games/ten-cards/index.html?v=2.8.1.1',
                '/minigame-collection/games/ten-cards/style.css?v=2.8.1.1',
                '/minigame-collection/img/banner/jump-n-fun.jpg',
                '/minigame-collection/img/banner/math-challenge.jpg',
                '/minigame-collection/img/banner/memory-match.jpg',
                '/minigame-collection/img/banner/number-guessing.jpg',
                '/minigame-collection/img/banner/peaceful-points.jpg',
                '/minigame-collection/img/banner/simon-says.jpg',
                '/minigame-collection/img/banner/ten-cards.jpg',
                '/minigame-collection/img/banner/tic-tac-toe.jpg',
                '/minigame-collection/src/modules/music.js?v=2.8.1.1',
                '/minigame-collection/src/modules/save.js?v=2.8.1.1',
                '/minigame-collection/src/modules/popupManager.js?v=2.8.1.1',
                '/minigame-collection/games/jump-n-fun/img/Character-Sheet.png',
                '/minigame-collection/games/peaceful-points/img/Character-Sheet.png',
                '/minigame-collection/offline.html?v=2.8.1.1',
            ]).catch(function (error) {
                console.error('Error caching files:', error);
            });
        }).then(() => self.skipWaiting())
    );
});


self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (CACHE_VERSION !== cacheName) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', function (event) {
    var request = event.request;
    var urlWithoutQuery = request.url; //.split('?')[0];

    if (urlWithoutQuery.endsWith('/')) {
        urlWithoutQuery += 'index.html?v=2.8.1.1';
    }

    var updatedRequest = new Request(urlWithoutQuery, {
        method: request.method,
        headers: request.headers,
        mode: 'cors',
        credentials: request.credentials,
        redirect: request.redirect,
        referrer: request.referrer,
        integrity: request.integrity
    });

    event.respondWith(
        caches.match(updatedRequest, { ignoreSearch: false })
            .then(function (response) {
                if (response) {
                    return response;
                }

                if (request.url.includes('manifest.json')) {
                    return fetch(request)
                        .then(response => {
                            if (!response || response.status !== 200) {
                                console.error('Failed to fetch manifest.json');
                                throw new Error('Failed to fetch manifest.json');
                            }
                            return response;
                        })
                        .catch(error => {
                            console.error('Fetch failed for manifest.json', error);
                            throw error;
                        });
                }

                var fetchRequest = request.clone();

                return fetch(fetchRequest).then(
                    function (response) {
                        if (!response || response.status !== 200) {
                            return response;
                        }

                        var responseToCache = response.clone();

                        caches.open(CACHE_VERSION)
                            .then(function (cache) {
                                cache.put(updatedRequest, responseToCache);
                            });

                        return response;
                    }
                ).catch(function () {
                    return caches.match('/minigame-collection/offline.html?v=2.8.1.1')
                        .catch(() => new Response('Offline and the offline page is not available'));
                });
            })
    );
});