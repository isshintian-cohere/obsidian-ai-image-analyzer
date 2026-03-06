export type Models = {
	name: string;
	model: string;
	imageReady: boolean;
	provider: Providers;
};

export type Providers = "ollama" | "gemini" | "cohere";

export const providerNames: Providers[] = ["ollama", "gemini", "cohere"];
