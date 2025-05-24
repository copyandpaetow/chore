const SERVICE_WORKER_PATH = "service-worker.js";

async function initializePWA() {
	try {
		console.log("Starting service worker registration...");

		const registration = await navigator.serviceWorker.register(
			SERVICE_WORKER_PATH,
			{
				scope: "/",
			}
		);

		console.log("Registration successful:", registration);
		console.log(
			"Service worker state:",
			registration.installing?.state,
			registration.waiting?.state,
			registration.active?.state
		);

		registration.addEventListener("updatefound", () => {
			console.log("update found");
		});

		console.log("Waiting for service worker to be ready...");
		const readyRegistration = await navigator.serviceWorker.ready;
		console.log("Service worker ready:", readyRegistration);

		await initializePushNotifications(readyRegistration);
		console.log("ServiceWorker registered with scope:", registration.scope);
		return registration;
	} catch (error) {
		console.error("ServiceWorker registration failed:", error);
	}
}

document.getElementById("push")?.addEventListener("click", initializePWA);

document.addEventListener("beforeinstallprompt", () => {
	console.log("PWA was installed");
	alert("PWA was installed");
	initializePWA();
});

document.addEventListener("appinstalled", () => {
	console.log("PWA was installed");
	alert("PWA was installed");
	initializePWA();
});

//

function urlBase64ToUint8Array(base64String: string) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

async function getVapidPublicKey() {
	const response = await fetch("/vapidPublicKey");
	const data = await response.json();
	return urlBase64ToUint8Array(data.publicKey);
}

async function initializePushNotifications(
	registration: ServiceWorkerRegistration
) {
	try {
		let permission = Notification.permission;
		console.log(Notification);

		if (permission !== "granted" && permission !== "denied") {
			permission = await Notification.requestPermission();
		}

		if (permission !== "granted") {
			console.log("Notification permission not granted");
			return;
		}

		const publicKey = await getVapidPublicKey();
		let subscription = await registration.pushManager.getSubscription();
		console.log("Existing subscription:", subscription);

		if (!subscription) {
			console.log("Push manager available:", registration.pushManager);

			try {
				subscription = await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: publicKey,
				});
				console.log("New subscription created:", subscription);
			} catch (subscribeError) {
				console.error("Subscription creation failed:", subscribeError);
				console.error("Error name:", subscribeError.name);
				console.error("Error message:", subscribeError.message);
				return;
			}
		}

		// Send the subscription to the server
		await saveSubscriptionToServer(subscription);

		console.log("Push notification setup complete");
	} catch (error) {
		console.error("Error setting up push notifications:", error);
	}
}

async function saveSubscriptionToServer(subscription: PushSubscription) {
	try {
		const response = await fetch("/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "same-origin",
			body: JSON.stringify(subscription),
		});

		const result = await response.json();

		if (!result.success) {
			console.error("Failed to save subscription to server:", result.error);
		}
	} catch (error) {
		console.error("Error saving subscription to server:", error);
	}
}
