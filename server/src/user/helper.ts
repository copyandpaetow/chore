export const getCurrentUser = (req: Request): { id: number } | null => {
	return (req as any).user || null;
};
