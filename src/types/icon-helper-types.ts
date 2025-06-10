// Define TypeScript interfaces
export interface ScanLogEntry {
	type: 'success' | 'warning' | 'error';
	message: string;
	details?: string;
}

export interface IconObject {
	name: string;
	folder: string;
	size: string;
	dimensions: string;
	path: string;
	content: string;
	selected: boolean;
	tags: string[]; // Array of tags for the icon
}

export interface DuplicateEntry {
	name: string;
	originalPath: string;
	duplicatePath: string;
}

export interface CollectionStats {
	totalFiles: number;
	totalFolders: number;
	duplicates: number;
	errors: number;
	uniqueTags: number; // Count of unique tags
}

// Define type for processing features
export type ProcessingFeature =
	| 'colorization'
	| 'replaceBlack'
	| 'preserveNone'
	| 'removeWhiteBg'
	| 'addRootFill'
	| 'standardization'
	| 'kebabCase'
	| 'addPrefix'
	| 'optimization'
	| 'iconSense'
	| 'nameSense'
	| 'tagSense';

export interface ProcessingFeatures {
	// Colorization features
	colorization: boolean;
	replaceBlack: boolean;
	preserveNone: boolean;
	removeWhiteBg: boolean;
	addRootFill: boolean;

	// Standardization features
	standardization: boolean;
	kebabCase: boolean;
	addPrefix: boolean;

	// Optimization feature
	optimization: boolean;

	// Icon Sense feature
	iconSense: boolean;
	nameSense: boolean;
	tagSense: boolean;
}

export interface ExportOptions {
	includeJson: boolean;
	includeTypescript: boolean;
	flatOutput: boolean;
	includeTags: boolean; // Option to include tags in exports
}

export interface ProcessedResults {
	processedCount: number;
	featuresApplied: string[];
	totalSize: string;
}
