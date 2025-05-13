export const config = {
	environment: process.env.NODE_ENV,
	isProduction: process.env.NODE_ENV === "production",
	port: process.env.PORT || 3000,
};
