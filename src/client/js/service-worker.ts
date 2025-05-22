// // service-worker.js

// // Cache name for app shell (static assets)
const CACHE_NAME = "chores-app-v1";

// // Cache name for dynamic content (HTML responses)
const DYNAMIC_CACHE = "chores-dynamic-v1";

// Assets to cache on install (app shell)
const STATIC_ASSETS = [
	"/",
	"/home.html",
	"/login.html",
	"/js/main.js",
	"/js/service-worker.js",
	"/css/main.css",
	"/icon.png",
	"/manifest.json",
	// Add other static assets
];

// Install event - cache the app shell
self.addEventListener("install", (event) => {
	console.log("install");
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				console.log("Caching app shell");
				return cache.addAll(STATIC_ASSETS);
			})
			.then(() => self.skipWaiting()) // Activate immediately
	);
});

// // Activate event - clean up old caches
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
				return self.clients.claim(); // Take control immediately
			})
	);
});

// // Fetch event - handle network requests
// self.addEventListener("fetch", (event) => {
// 	// Skip non-GET requests and browser extensions
// 	if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
// 		return;
// 	}

// 	// Handle API requests differently from static assets
// 	if (
// 		event.request.url.includes("/chores/") ||
// 		event.request.url.includes("/auth/")
// 	) {
// 		// For API requests, try network first, then cache
// 		event.respondWith(
// 			fetch(event.request)
// 				.then((response) => {
// 					// Clone the response before using it
// 					const responseToCache = response.clone();

// 					// Only cache successful responses
// 					if (response.ok) {
// 						caches.open(DYNAMIC_CACHE).then((cache) => {
// 							// Cache the response for future offline use
// 							cache.put(event.request, responseToCache);
// 						});
// 					}

// 					return response;
// 				})
// 				.catch(() => {
// 					// If network fails, try to get from cache
// 					return caches.match(event.request);
// 				})
// 		);
// 	} else {
// 		// For static assets, try cache first, then network
// 		event.respondWith(
// 			caches.match(event.request).then((response) => {
// 				// If found in cache, return it
// 				if (response) {
// 					return response;
// 				}

// 				// Otherwise fetch from network
// 				return fetch(event.request).then((networkResponse) => {
// 					// Clone the response
// 					const responseToCache = networkResponse.clone();

// 					// Cache for future requests
// 					caches.open(CACHE_NAME).then((cache) => {
// 						cache.put(event.request, responseToCache);
// 					});

// 					return networkResponse;
// 				});
// 			})
// 		);
// 	}
// });

// // Push event - handle push notifications
// self.addEventListener("push", (event) => {
// 	console.log("Push notification received");

// 	// Parse the data sent from the server
// 	let data;
// 	try {
// 		data = event.data.json();
// 	} catch (error) {
// 		console.error("Error parsing push data:", error);
// 		data = {
// 			title: "New Update",
// 			type: "GENERIC_UPDATE",
// 		};
// 	}

// 	// Handle silent push (background sync)
// 	if (data.silent) {
// 		event.waitUntil(handleSilentPush(data));
// 		return;
// 	}

// 	// For non-silent push, show a notification and update cache
// 	event.waitUntil(
// 		Promise.all([
// 			// Show notification to user
// 			showNotification(data),

// 			// Update cached data silently
// 			updateCacheForPush(data),

// 			// Notify any open clients
// 			notifyClients(data),
// 		])
// 	);
// });

// // Handle silent push (no visible notification)
// async function handleSilentPush(data) {
// 	// Update the cache with latest data
// 	await updateCacheForPush(data);

// 	// Notify any open clients about the update
// 	await notifyClients(data);

// 	// No notification is shown
// 	console.log("Silent push handled:", data.type);
// }

// // Show a notification to the user
// async function showNotification(data) {
// 	// Create notification options based on data type
// 	let options = {
// 		icon: "/icon-192.png",
// 		badge: "/badge-icon.png",
// 		timestamp: data.timestamp || Date.now(),
// 		data: data,
// 	};

// 	switch (data.type) {
// 		case "CHORE_CREATED":
// 			options.body = `New chore: ${data.title}`;
// 			options.tag = `chore-created-${data.choreId}`;
// 			break;

// 		case "CHORE_UPDATED":
// 			options.body = `Chore updated: ${data.title}`;
// 			options.tag = `chore-updated-${data.choreId}`;
// 			break;

// 		case "CHORE_COMPLETED":
// 			options.body = `Chore completed: ${data.title}`;
// 			options.tag = `chore-completed-${data.choreId}`;
// 			break;

// 		case "CHORE_DUE_SOON":
// 			options.body = `Chore due soon: ${data.title}`;
// 			options.tag = `chore-due-${data.choreId}`;
// 			break;

// 		default:
// 			options.body = "You have a new update";
// 			options.tag = "generic-update";
// 	}

// 	return self.registration.showNotification(
// 		data.title || "Chores App",
// 		options
// 	);
// }

// // Update the cache based on push data
// async function updateCacheForPush(data) {
// 	try {
// 		// Different updates based on notification type
// 		switch (data.type) {
// 			case "CHORE_UPDATED":
// 			case "CHORE_COMPLETED":
// 				// Fetch the updated chore
// 				const choreResponse = await fetch(`/chores/${data.choreId}`);
// 				if (!choreResponse.ok) throw new Error("Failed to fetch updated chore");

// 				const chore = await choreResponse.json();

// 				// Update the cache with this chore
// 				await updateChoreInCache(chore);
// 				break;

// 			case "CHORE_CREATED":
// 				// For new chores, refresh the entire list
// 				await refreshChoresList();
// 				break;

// 			case "FULL_SYNC_REQUIRED":
// 				// Perform a full sync with server
// 				await refreshChoresList();
// 				break;
// 		}
// 	} catch (error) {
// 		console.error("Error updating cache for push:", error);
// 	}
// }

// // Update a specific chore in the cached HTML
// async function updateChoreInCache(chore) {
// 	try {
// 		// Open the dynamic cache
// 		const cache = await caches.open(DYNAMIC_CACHE);

// 		// Get the main chores page from cache
// 		const response = await cache.match("/chores");
// 		if (!response) {
// 			console.log("No cached chores page found");
// 			return;
// 		}

// 		// Get the HTML content
// 		const html = await response.text();

// 		// Parse the HTML
// 		const parser = new DOMParser();
// 		const doc = parser.parseFromString(html, "text/html");

// 		// Find the chore element
// 		const choreElement = doc.querySelector(`#chore-${chore.id}`);
// 		if (!choreElement) {
// 			console.log(`Chore ${chore.id} not found in cached HTML`);
// 			return;
// 		}

// 		// Update the chore element based on the new data
// 		choreElement.querySelector(".title").textContent = chore.title;
// 		choreElement.querySelector(".description").textContent =
// 			chore.description || "";
// 		choreElement.querySelector(".due-date").textContent = `Next due: ${new Date(
// 			chore.next_due_date
// 		).toLocaleDateString()}`;

// 		// Update completion status
// 		if (chore.last_completed_at) {
// 			choreElement.classList.add("completed");
// 			const completionElem = choreElement.querySelector(".last-completed");
// 			if (completionElem) {
// 				completionElem.textContent = `Last completed: ${new Date(
// 					chore.last_completed_at
// 				).toLocaleDateString()}`;
// 			}
// 		} else {
// 			choreElement.classList.remove("completed");
// 		}

// 		// Create a new response with the updated HTML
// 		const updatedResponse = new Response(doc.documentElement.outerHTML, {
// 			headers: response.headers,
// 		});

// 		// Update the cache
// 		await cache.put("/chores", updatedResponse);
// 		console.log(`Updated chore ${chore.id} in cache`);
// 	} catch (error) {
// 		console.error("Error updating chore in cache:", error);
// 	}
// }

// // Refresh the entire chores list in the cache
// async function refreshChoresList() {
// 	try {
// 		// Fetch the latest chores list
// 		const response = await fetch("/chores/all", {
// 			credentials: "same-origin",
// 		});

// 		if (!response.ok) throw new Error("Failed to fetch chores list");

// 		// Cache this response
// 		const cache = await caches.open(DYNAMIC_CACHE);
// 		await cache.put("/chores/all", response.clone());

// 		// Also update the cached HTML page if it exists
// 		const htmlResponse = await cache.match("/chores");
// 		if (htmlResponse) {
// 			// Fetch fresh HTML
// 			const freshHtmlResponse = await fetch("/chores", {
// 				credentials: "same-origin",
// 			});

// 			if (freshHtmlResponse.ok) {
// 				await cache.put("/chores", freshHtmlResponse);
// 				console.log("Updated cached chores page");
// 			}
// 		}
// 	} catch (error) {
// 		console.error("Error refreshing chores list:", error);
// 	}
// }

// // Notify any open clients about the update
// async function notifyClients(data) {
// 	const clients = await self.clients.matchAll({ type: "window" });

// 	if (clients.length === 0) {
// 		console.log("No clients to notify");
// 		return;
// 	}

// 	// Send message to all open clients
// 	clients.forEach((client) => {
// 		client.postMessage(data);
// 	});

// 	console.log(`Notified ${clients.length} clients about ${data.type}`);
// }

// // Notification click event - handle notification interactions
// self.addEventListener("notificationclick", (event) => {
// 	event.notification.close();

// 	const data = event.notification.data;

// 	// Open or focus the appropriate page based on notification type
// 	const urlToOpen = data.choreId
// 		? `/chores?highlight=${data.choreId}`
// 		: "/chores";

// 	event.waitUntil(
// 		self.clients.matchAll({ type: "window" }).then((clientList) => {
// 			// Check if there's already a window open
// 			for (const client of clientList) {
// 				if (client.url.includes(urlToOpen) && "focus" in client) {
// 					return client.focus();
// 				}
// 			}

// 			// If no open window, open a new one
// 			if (self.clients.openWindow) {
// 				return self.clients.openWindow(urlToOpen);
// 			}
// 		})
// 	);
// });

// // Background sync event - handle offline operations
// self.addEventListener("sync", (event) => {
// 	if (event.tag === "sync-chores") {
// 		event.waitUntil(syncChores());
// 	}
// });

// // Sync chores with the server
// async function syncChores() {
// 	try {
// 		// Get pending operations from IndexedDB
// 		const pendingOps = await getPendingOperations();

// 		if (pendingOps.length === 0) {
// 			console.log("No pending operations to sync");
// 			return;
// 		}

// 		console.log(`Syncing ${pendingOps.length} pending operations`);

// 		// Process each operation
// 		for (const op of pendingOps) {
// 			try {
// 				// Send the operation to the server
// 				await processPendingOperation(op);

// 				// Remove from pending queue
// 				await removePendingOperation(op.id);
// 			} catch (error) {
// 				console.error(`Failed to process operation ${op.id}:`, error);
// 			}
// 		}

// 		// After syncing all operations, refresh the cached data
// 		await refreshChoresList();

// 		// Notify any open clients that sync is complete
// 		const clients = await self.clients.matchAll({ type: "window" });
// 		clients.forEach((client) => {
// 			client.postMessage({ type: "SYNC_COMPLETE" });
// 		});
// 	} catch (error) {
// 		console.error("Error during chores sync:", error);
// 	}
// }

// // Helper to get pending operations from IndexedDB
// // This is a simplified version - in a real app, use idb or another IndexedDB library
// async function getPendingOperations() {
// 	return new Promise((resolve, reject) => {
// 		const request = indexedDB.open("chores-offline-db", 1);

// 		request.onerror = () => reject(request.error);

// 		request.onupgradeneeded = (event) => {
// 			const db = event.target.result;
// 			if (!db.objectStoreNames.contains("pending-operations")) {
// 				db.createObjectStore("pending-operations", { keyPath: "id" });
// 			}
// 		};

// 		request.onsuccess = (event) => {
// 			const db = event.target.result;
// 			const transaction = db.transaction("pending-operations", "readonly");
// 			const store = transaction.objectStore("pending-operations");
// 			const getAll = store.getAll();

// 			getAll.onsuccess = () => resolve(getAll.result);
// 			getAll.onerror = () => reject(getAll.error);
// 		};
// 	});
// }

// // Process a pending operation
// async function processPendingOperation(operation) {
// 	const { type, choreId, payload } = operation;

// 	switch (type) {
// 		case "COMPLETE_CHORE":
// 			return fetch(`/chores/${choreId}/complete`, {
// 				method: "POST",
// 				headers: { "Content-Type": "application/json" },
// 				credentials: "same-origin",
// 				body: JSON.stringify(payload),
// 			});

// 		case "CREATE_CHORE":
// 			return fetch("/chores/create", {
// 				method: "POST",
// 				headers: { "Content-Type": "application/json" },
// 				credentials: "same-origin",
// 				body: JSON.stringify(payload),
// 			});

// 		case "DELETE_CHORE":
// 			return fetch(`/chores/${choreId}`, {
// 				method: "DELETE",
// 				credentials: "same-origin",
// 			});

// 		default:
// 			throw new Error(`Unknown operation type: ${type}`);
// 	}
// }

// // Remove a pending operation from IndexedDB
// async function removePendingOperation(id) {
// 	return new Promise((resolve, reject) => {
// 		const request = indexedDB.open("chores-offline-db", 1);

// 		request.onerror = () => reject(request.error);

// 		request.onsuccess = (event) => {
// 			const db = event.target.result;
// 			const transaction = db.transaction("pending-operations", "readwrite");
// 			const store = transaction.objectStore("pending-operations");
// 			const deleteRequest = store.delete(id);

// 			deleteRequest.onsuccess = () => resolve();
// 			deleteRequest.onerror = () => reject(deleteRequest.error);
// 		};
// 	});
// }
