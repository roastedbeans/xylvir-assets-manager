import sharp from 'sharp';

export async function convertSvgToPng(
	svgInput: string | Buffer,
	width: number = 256,
	height: number = 256,
	quality: number = 100,
	compressionLevel: number = 6
) {
	try {
		// Convert string to Buffer if needed
		const svgBuffer = typeof svgInput === 'string' ? Buffer.from(svgInput, 'utf-8') : svgInput;

		// Validate SVG input
		if (!svgBuffer || svgBuffer.length === 0) {
			throw new Error('Invalid SVG input: empty or null');
		}

		// Convert SVG to PNG using Sharp
		const pngBuffer = await sharp(svgBuffer)
			.resize(width, height, {
				fit: 'inside',
				withoutEnlargement: true,
				background: { r: 255, g: 255, b: 255, alpha: 1 },
			})
			.png({
				quality,
				compressionLevel,
				progressive: false, // Better for small icons
				force: true,
			})
			.toBuffer();

		// Convert to base64 data URL
		const base64String = pngBuffer.toString('base64');
		return `data:image/png;base64,${base64String}`;
	} catch (error) {
		throw new Error(`SVG to PNG conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}
