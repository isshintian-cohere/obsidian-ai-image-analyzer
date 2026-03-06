import AIImageAnalyzerPlugin from "../../main";
import { Notice, Setting } from "obsidian";
import { Provider } from "../provider";
import { Models } from "../types";
import { possibleModels } from "../globals";
import { saveSettings, settings } from "../../settings";
import { CohereClientV2 } from "cohere-ai";
import { debugLog } from "../../util";

const context = "ai-adapter/providers/cohereProvider";

let cohere: CohereClientV2;

export type CohereSettings = {
	lastModel: Models;
	lastImageModel: Models;
	apiKey: string;
};

export const DEFAULT_COHERE_SETTINGS: CohereSettings = {
	lastModel: possibleModels[15],
	lastImageModel: possibleModels[15],
	apiKey: "",
};

export class CohereProvider extends Provider {
	constructor() {
		super();
		this.lastModel = settings.aiAdapterSettings.cohereSettings.lastModel;
		this.lastImageModel =
			settings.aiAdapterSettings.cohereSettings.lastImageModel;
		CohereProvider.restartSession();
	}

	generateSettings(containerEl: HTMLElement, plugin: AIImageAnalyzerPlugin) {
		new Setting(containerEl).setName("Cohere").setHeading();

		new Setting(containerEl)
			.setName("Cohere API key")
			.setDesc("Set your Cohere API token")
			.addText((text) =>
				text
					.setValue(
						settings.aiAdapterSettings.cohereSettings.apiKey !== ""
							? "••••••••••"
							: "",
					)
					.onChange(async (value) => {
						if (value.contains("•")) {
							return;
						}
						settings.aiAdapterSettings.cohereSettings.apiKey =
							value;
						CohereProvider.restartSession();
						await saveSettings(plugin);
					}),
			);
	}

	async queryHandling(prompt: string): Promise<string> {
		try {
			const response = await cohere.chat({
				model: settings.aiAdapterSettings.selectedModel.model,
				messages: [
					{
						role: "user",
						content: [{ type: "text", text: prompt }],
					},
				],
				temperature: 0.3,
			});

			const text = this.extractTextFromContent(
				response.message.content ?? [],
			);
			if (!text) {
				return "[AI-ERROR] No response from Cohere API";
			}
			return text;
		} catch (e) {
			debugLog(context, e);
			return "[AI-ERROR] " + (e instanceof Error ? e.message : String(e));
		}
	}

	async queryWithImageHandling(
		prompt: string,
		image: string,
	): Promise<string> {
		try {
			const dataUrl = "data:image/png;base64," + image;
			const response = await cohere.chat({
				model: settings.aiAdapterSettings.selectedImageModel.model,
				messages: [
					{
						role: "user",
						content: [
							{ type: "text", text: prompt },
							{
								type: "image_url",
								imageUrl: { url: dataUrl },
							},
						],
					},
				],
				temperature: 0.3,
			});

			const text = this.extractTextFromContent(
				response.message.content ?? [],
			);
			if (!text) {
				return "[AI-ERROR] No response from Cohere API";
			}
			return text;
		} catch (e) {
			debugLog(context, e);
			return "[AI-ERROR] " + (e instanceof Error ? e.message : String(e));
		}
	}

	private extractTextFromContent(
		content: Array<{ type: string; text?: string }>,
	): string {
		if (!content || content.length === 0) return "";
		const parts = content
			.filter((block): block is { type: "text"; text: string } =>
				block.type === "text" && typeof block.text === "string",
			)
			.map((block) => block.text);
		return parts.join("\n");
	}

	setLastModel(model: Models) {
		super.setLastModel(model);
		settings.aiAdapterSettings.cohereSettings.lastModel = model;
	}

	setLastImageModel(model: Models) {
		super.setLastImageModel(model);
		settings.aiAdapterSettings.cohereSettings.lastImageModel = model;
	}

	static restartSession() {
		cohere = new CohereClientV2({
			token: settings.aiAdapterSettings.cohereSettings.apiKey,
		});
	}
}
