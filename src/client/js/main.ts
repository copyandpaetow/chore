console.log("main");

// async function updateCacheFromCurrentDOM() {
// 	// Get the current state of the page after JS modifications
// 	const currentHTML = document.documentElement.outerHTML;

// 	// Create a new response with this HTML
// 	const newResponse = new Response(currentHTML, {
// 		headers: {
// 			"Content-Type": "text/html",
// 		},
// 	});

// 	// Update the cache
// 	const cache = await caches.open("chores-cache");
// 	await cache.put("/chores", newResponse);
// }

// // In your main client JavaScript file (e.g., main.js)
const SERVICE_WORKER_PATH = "/js/service-worker.js";

// Initialize the PWA functionality
async function initializePWA() {
	// Check if service workers are supported
	if ("serviceWorker" in navigator) {
		try {
			// Register the service worker
			const registration = await navigator.serviceWorker.register(
				SERVICE_WORKER_PATH
			);
			console.log("ServiceWorker registered with scope:", registration.scope);

			// Initialize push notifications
			// await initializePushNotifications(registration);

			// // Setup communication with the service worker
			// setupServiceWorkerCommunication();
		} catch (error) {
			console.error("ServiceWorker registration failed:", error);
		}
	} else {
		console.log("Service workers are not supported in this browser");
	}
}

initializePWA();

// // Initialize push notifications
// async function initializePushNotifications(registration) {
// 	try {
// 		// First, check if push is supported
// 		if (!("PushManager" in window)) {
// 			console.log("Push notifications are not supported in this browser");
// 			return;
// 		}

// 		// Check if we already have notification permission
// 		let permission = Notification.permission;

// 		// If permission is not granted and not denied, request it
// 		if (permission !== "granted" && permission !== "denied") {
// 			permission = await Notification.requestPermission();
// 		}

// 		if (permission !== "granted") {
// 			// User denied permission or we don't have it yet
// 			console.log("Notification permission not granted");
// 			return;
// 		}

// 		// Get the public VAPID key from the server
// 		const response = await fetch("/push/vapidPublicKey");
// 		const { publicKey } = await response.json();

// 		// Convert the VAPID key to the format expected by the browser
// 		const convertedKey = urlBase64ToUint8Array(publicKey);

// 		// Get the current subscription or subscribe
// 		let subscription = await registration.pushManager.getSubscription();

// 		// If we don't have a subscription yet, create one
// 		if (!subscription) {
// 			subscription = await registration.pushManager.subscribe({
// 				userVisibleOnly: true, // Chrome requires this to be true
// 				applicationServerKey: convertedKey,
// 			});
// 		}

// 		// Send the subscription to the server
// 		await saveSubscriptionToServer(subscription);

// 		console.log("Push notification setup complete");
// 	} catch (error) {
// 		console.error("Error setting up push notifications:", error);
// 	}
// }

// // Save subscription to the server
// async function saveSubscriptionToServer(subscription) {
// 	try {
// 		const response = await fetch("/push/register", {
// 			method: "POST",
// 			headers: {
// 				"Content-Type": "application/json",
// 			},
// 			credentials: "same-origin", // Important for auth cookies
// 			body: JSON.stringify(subscription),
// 		});

// 		const result = await response.json();

// 		if (!result.success) {
// 			console.error("Failed to save subscription to server:", result.error);
// 		}
// 	} catch (error) {
// 		console.error("Error saving subscription to server:", error);
// 	}
// }

// // Set up communication with the service worker
// function setupServiceWorkerCommunication() {
// 	// Listen for messages from the service worker
// 	navigator.serviceWorker.addEventListener("message", (event) => {
// 		const data = event.data;

// 		// Handle different message types
// 		switch (data.type) {
// 			case "CHORE_UPDATED":
// 				// Show a non-intrusive update notification
// 				showUpdateNotification(data);
// 				break;

// 			case "CHORE_COMPLETED":
// 				// Update the UI to reflect the completed chore
// 				updateChoreCompletionUI(data);
// 				break;

// 			case "SYNC_REQUIRED":
// 				// Perform a sync with the server
// 				syncWithServer();
// 				break;
// 		}
// 	});
// }

// // Show a notification banner in the app
// function showUpdateNotification(data) {
// 	const notificationContainer = document.getElementById("update-notification");
// 	if (!notificationContainer) return;

// 	// Create notification content
// 	notificationContainer.innerHTML = `
//     <div class="notification-content">
//       <p>${data.title} was updated</p>
//       <button id="refresh-btn">Refresh</button>
//       <button id="dismiss-btn">Dismiss</button>
//     </div>
//   `;

// 	// Show the notification
// 	notificationContainer.classList.add("visible");

// 	// Add event listeners
// 	document.getElementById("refresh-btn").addEventListener("click", () => {
// 		window.location.reload();
// 	});

// 	document.getElementById("dismiss-btn").addEventListener("click", () => {
// 		notificationContainer.classList.remove("visible");
// 	});
// }

// // Update the UI for a completed chore
// function updateChoreCompletionUI(data) {
// 	const choreElement = document.getElementById(`chore-${data.choreId}`);
// 	if (!choreElement) return;

// 	// Update the UI to show completed state
// 	choreElement.classList.add("completed");

// 	// Update the due date
// 	const dueDateElement = choreElement.querySelector(".due-date");
// 	if (dueDateElement && data.nextDueDate) {
// 		dueDateElement.textContent = `Next due: ${new Date(
// 			data.nextDueDate
// 		).toLocaleDateString()}`;
// 	}

// 	// Show a subtle notification
// 	showToast(`"${data.title}" was completed by someone else`);
// }

// // Helper function to convert base64 to Uint8Array for VAPID key
// function urlBase64ToUint8Array(base64String) {
// 	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
// 	const base64 = (base64String + padding)
// 		.replace(/\-/g, "+")
// 		.replace(/_/g, "/");

// 	const rawData = window.atob(base64);
// 	const outputArray = new Uint8Array(rawData.length);

// 	for (let i = 0; i < rawData.length; ++i) {
// 		outputArray[i] = rawData.charCodeAt(i);
// 	}
// 	return outputArray;
// }

// // Show a toast message
// function showToast(message) {
// 	const toast = document.createElement("div");
// 	toast.className = "toast";
// 	toast.textContent = message;

// 	document.body.appendChild(toast);

// 	// Remove after 3 seconds
// 	setTimeout(() => {
// 		toast.classList.add("fade-out");
// 		setTimeout(() => {
// 			document.body.removeChild(toast);
// 		}, 300);
// 	}, 3000);
// }

// // Sync with the server
// async function syncWithServer() {
// 	try {
// 		const response = await fetch("/chores/all");
// 		if (!response.ok) throw new Error("Failed to sync with server");

// 		const data = await response.json();

// 		if (data.success) {
// 			// Update the UI with the new data
// 			updateChoresUI(data.chores);
// 		}
// 	} catch (error) {
// 		console.error("Error syncing with server:", error);
// 	}
// }
