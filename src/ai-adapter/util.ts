import { settings } from "../settings";
import { Provider } from "./provider";
import { OllamaProvider } from "./providers/ollamaProvider";
import { GeminiProvider } from "./providers/geminiProvider";
import { CohereProvider } from "./providers/cohereProvider";
import { provider } from "./globals";
import { Notice } from "obsidian";
import { debugLog } from "../util";

const context = "ai-adapter/util";

export function initProvider(): Provider {
	debugLog(
		context,
		"Initializing provider: " + settings.aiAdapterSettings.provider,
	);
	switch (settings.aiAdapterSettings.provider) {
		case "ollama":
			return new OllamaProvider();
		case "gemini":
			return new GeminiProvider();
		case "cohere":
			return new CohereProvider();
		default:
			// Fallback if provider is missing/corrupted (e.g. from old settings)
			return new OllamaProvider();
	}
}

export function checkProviderReady() {
	if (!provider) {
		debugLog(context, "Provider not initialized");
		new Notice("Provider not initialized");
		throw new Error("Provider not initialized");
	}
}
