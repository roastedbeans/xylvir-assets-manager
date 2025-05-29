// Utility functions for SVG handling
export const formatFileSize = (bytes: number): string => {
	if (bytes < 1024) return `${bytes}B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

export const estimateSvgDimensions = (svgContent: string): string => {
	const widthMatch = svgContent.match(/width=["'](\d+)/);
	const heightMatch = svgContent.match(/height=["'](\d+)/);
	const width = widthMatch ? widthMatch[1] : '24';
	const height = heightMatch ? heightMatch[1] : '24';
	return `${width}x${height}`;
};
