const CACHE_NAME = "chores-app-v1";
const DYNAMIC_CACHE = "chores-dynamic-v1";

const STATIC_ASSETS = [
	"/",
	"/home.html",
	"/login.html",
	"/main.js",
	"/service-worker.js",
	"/main.css",
	"/assets/android-chrome-512x512.png",
	"/assets/manifest.json",
];

self.addEventListener("install", (event) => {
	console.log("install");
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				console.log("Caching app shell");
				return cache.addAll(STATIC_ASSETS);
			})
			.then(() => self.skipWaiting())
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames
						.filter((cacheName) => {
							return cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE;
						})
						.map((cacheName) => {
							console.log("Deleting old cache:", cacheName);
							return caches.delete(cacheName);
						})
				);
			})
			.then(() => {
				console.log("Service Worker activated");
				return self.clients.claim();
			})
	);
});
self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			// Return cached version or fetch from network
			return (
				response ||
				fetch(event.request).then((fetchResponse) => {
					// Optionally cache dynamic responses
					if (event.request.url.startsWith(self.location.origin)) {
						const responseClone = fetchResponse.clone();
						caches.open(DYNAMIC_CACHE).then((cache) => {
							cache.put(event.request, responseClone);
						});
					}
					return fetchResponse;
				})
			);
		})
	);
});

self.addEventListener("push", (event) => {
	console.log(event.data);
	try {
		const data = event.data ? event.data.json() : {};

		if (data.type === "silent-update") {
			// Silent background fetch for your HTML updates
			event.waitUntil(
				fetch("/")
					.then((response) => response.text())
					.then((html) => {
						return caches.open(DYNAMIC_CACHE).then((cache) => {
							cache.put("/", new Response(html));
						});
					})
			);
		} else {
			// Show visible notification
			const options = {
				title: data.title || "Chores App",
				body: data.body || "New update available",
				icon: "/assets/icon.png",
				badge: "/assets/badge.png",
			};

			event.waitUntil(
				self.registration.showNotification(options.title, options)
			);
		}
	} catch (error) {
		console.warn(error);
	}
});
