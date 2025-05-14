export const getCurrentUser = (req: Request): { id: string } | null => {
	return (req as any).user || null;
};
