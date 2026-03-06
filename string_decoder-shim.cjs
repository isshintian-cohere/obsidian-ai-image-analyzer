/**
 * Minimal string_decoder shim for Obsidian/Electron renderer where require('string_decoder') may be unavailable.
 * Provides a minimal StringDecoder so bundled code that requires this module does not crash.
 */
class StringDecoder {
	constructor(encoding) {
		this.encoding = encoding || "utf8";
	}

	write(buffer) {
		if (buffer == null) return "";
		if (typeof buffer === "string") return buffer;
		if (buffer instanceof Uint8Array) {
			return new TextDecoder(this.encoding).decode(buffer);
		}
		if (typeof Buffer !== "undefined" && buffer instanceof Buffer) {
			return buffer.toString(this.encoding);
		}
		return String(buffer);
	}

	end(buffer) {
		return this.write(buffer || null);
	}
}

module.exports = { StringDecoder };
module.exports.StringDecoder = StringDecoder;
