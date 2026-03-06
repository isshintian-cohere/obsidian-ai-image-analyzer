/**
 * Minimal process shim for Obsidian/Electron renderer where require('process') may be unavailable.
 * Provides the fields commonly used by SDKs (cohere-ai, etc.) without relying on Node's process.
 */
module.exports = typeof process !== "undefined" && process?.versions?.node
	? process
	: {
			env: typeof process !== "undefined" && process?.env ? process.env : {},
			versions: { node: "0.0.0" },
			version: "v0.0.0",
			cwd: () => "/",
			browser: true,
		};
