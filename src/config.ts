export const config = {
	environment: process.env.NODE_ENV,
	isProduction: process.env.NODE_ENV !== "development",
	port: process.env.PORT || 3000,
	webPushPublicKey: process.env.WEB_PUSH_PUBLIC_KEY || "",
	webPushPrivateKey: process.env.WEB_PUSH_PRIVATE_KEY || "",
	email: process.env.EMAIL || "",
} as const;
