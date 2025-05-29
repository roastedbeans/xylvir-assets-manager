'use client';
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, FolderUp, FileUp, AlertTriangle } from 'lucide-react';
import { DownloadIcon, FolderIcon, FileIcon, ArchiveIcon } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Define TypeScript interfaces
interface ScanLogEntry {
	type: 'success' | 'warning' | 'error';
	message: string;
	details?: string;
}

interface IconObject {
	name: string;
	folder: string;
	size: string;
	dimensions: string;
	path: string;
	content: string;
	selected: boolean;
}

interface DuplicateEntry {
	name: string;
	originalPath: string;
	duplicatePath: string;
}

interface CollectionStats {
	totalFiles: number;
	totalFolders: number;
	duplicates: number;
	errors: number;
}

const IconManagementSystem = () => {
	const [activeStep, setActiveStep] = useState('collection');
	const [scanProgress, setScanProgress] = useState(0);
	const [processProgress, setProcessProgress] = useState(0);
	const [dryRun, setDryRun] = useState(true);
	const [collectionStats, setCollectionStats] = useState<CollectionStats>({
		totalFiles: 0,
		totalFolders: 0,
		duplicates: 0,
		errors: 0,
	});
	const [mockIcons] = useState<IconObject[]>([
		{
			name: 'arrow-right.svg',
			folder: '/navigation',
			size: '1.2KB',
			dimensions: '24x24',
			path: '/navigation/arrow-right.svg',
			content:
				'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>',
			selected: false,
		},
		{
			name: 'check.svg',
			folder: '/status',
			size: '0.8KB',
			dimensions: '20x20',
			path: '/status/check.svg',
			content:
				'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
			selected: false,
		},
		{
			name: 'close.svg',
			folder: '/actions',
			size: '0.9KB',
			dimensions: '24x24',
			path: '/actions/close.svg',
			content:
				'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>',
			selected: false,
		},
		{
			name: 'settings.svg',
			folder: '/system',
			size: '1.5KB',
			dimensions: '24x24',
			path: '/system/settings.svg',
			content:
				'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
			selected: false,
		},
		{
			name: 'user.svg',
			folder: '/users',
			size: '1.3KB',
			dimensions: '24x24',
			path: '/users/user.svg',
			content:
				'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
			selected: false,
		},
		{
			name: 'home.svg',
			folder: '/navigation',
			size: '1.1KB',
			dimensions: '24x24',
			path: '/navigation/home.svg',
			content:
				'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
			selected: false,
		},
	]);
	const [isScanning, setIsScanning] = useState(false);
	const [consolidatedIcons, setConsolidatedIcons] = useState<IconObject[]>([]);
	const [scanLog, setScanLog] = useState<ScanLogEntry[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Define type for processing features
	type ProcessingFeature =
		| 'colorization'
		| 'replaceBlack'
		| 'preserveNone'
		| 'removeWhiteBg'
		| 'addRootFill'
		| 'standardization'
		| 'kebabCase'
		| 'addPrefix'
		| 'optimization';

	// Add state for processing features
	const [processingFeatures, setProcessingFeatures] = useState({
		// Colorization features
		colorization: true,
		replaceBlack: true,
		preserveNone: true,
		removeWhiteBg: true,
		addRootFill: true,

		// Standardization features
		standardization: true,
		kebabCase: true,
		addPrefix: false,

		// Optimization feature
		optimization: true,
	});

	// Add state for export options
	const [exportOptions, setExportOptions] = useState({
		includeJson: true,
		includeTypescript: true,
		preserveFolderStructure: true,
		flatOutput: false,
	});

	// Add state for processed results
	const [processedResults, setProcessedResults] = useState<{
		processedCount: number;
		featuresApplied: string[];
		totalSize: string;
	}>({
		processedCount: 0,
		featuresApplied: [],
		totalSize: '0KB',
	});

	// Add handler for toggling processing features
	const toggleProcessingFeature = (feature: ProcessingFeature) => {
		setProcessingFeatures((prev) => ({
			...prev,
			[feature]: !prev[feature],
		}));

		// Handle parent-child relationships
		if (feature === 'colorization' && !processingFeatures.colorization) {
			// If enabling colorization, don't change children
		} else if (feature === 'colorization' && processingFeatures.colorization) {
			// If disabling colorization, disable all children
			setProcessingFeatures((prev) => ({
				...prev,
				replaceBlack: false,
				preserveNone: false,
				removeWhiteBg: false,
				addRootFill: false,
			}));
		} else if (feature === 'standardization' && !processingFeatures.standardization) {
			// If enabling standardization, don't change children
		} else if (feature === 'standardization' && processingFeatures.standardization) {
			// If disabling standardization, disable all children
			setProcessingFeatures((prev) => ({
				...prev,
				kebabCase: false,
				addPrefix: false,
			}));
		}

		// If any child feature is enabled, make sure parent is enabled too
		if (
			['replaceBlack', 'preserveNone', 'removeWhiteBg', 'addRootFill'].includes(feature) &&
			!processingFeatures[feature]
		) {
			setProcessingFeatures((prev) => ({
				...prev,
				colorization: true,
			}));
		} else if (['kebabCase', 'addPrefix'].includes(feature) && !processingFeatures[feature]) {
			setProcessingFeatures((prev) => ({
				...prev,
				standardization: true,
			}));
		}
	};

	const handleFolderSelect = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		// Start the collection process
		collectIcons(files);
	};

	const collectIcons = (fileList: FileList) => {
		setIsScanning(true);
		setScanProgress(0);
		setScanLog([]);

		// Convert FileList to array for easier processing
		const files = Array.from(fileList);

		// Filter for SVG files only
		const svgFiles = files.filter((file) => file.name.toLowerCase().endsWith('.svg'));

		if (svgFiles.length === 0) {
			toast.error('No SVG files found in the selected folders');
			setIsScanning(false);
			return;
		}

		// Track folders to count them
		const folders = new Set<string>();

		// Track potential duplicates by filename
		const filenameMap = new Map<string, string>();
		const duplicates: DuplicateEntry[] = [];

		// Process icons with simulated progress
		let processedCount = 0;
		const totalFiles = svgFiles.length;
		const processedIcons: IconObject[] = [];

		// Simulate processing files with a delay to show progress
		const processNextFile = (index: number) => {
			if (index >= svgFiles.length) {
				// Finished processing all files
				setCollectionStats({
					totalFiles: processedIcons.length,
					totalFolders: folders.size,
					duplicates: duplicates.length,
					errors: 0,
				});
				setConsolidatedIcons(processedIcons);
				setIsScanning(false);
				setScanProgress(100);

				toast.success(`Successfully collected ${processedIcons.length} icons`);

				// Auto-advance to display step after a short delay
				setTimeout(() => {
					setActiveStep('display');
				}, 1000);

				return;
			}

			const file = svgFiles[index];
			// Use a TypeScript assertion since webkitRelativePath exists on File objects from webkitdirectory input
			const filePath = (file as unknown as { webkitRelativePath: string }).webkitRelativePath || '';
			const pathParts = filePath.split('/');
			const fileName = pathParts[pathParts.length - 1];
			const folderPath = pathParts.slice(0, -1).join('/');

			// Add to folder set
			if (folderPath) {
				folders.add(folderPath);
			}

			// Check for duplicate filenames
			if (filenameMap.has(fileName)) {
				duplicates.push({
					name: fileName,
					originalPath: filenameMap.get(fileName) || '',
					duplicatePath: filePath,
				});

				// Add log entry for duplicate
				setScanLog((prevLogs) => [
					...prevLogs,
					{
						type: 'warning',
						message: `Duplicate found: ${fileName}`,
						details: `in ${folderPath}`,
					},
				]);

				// Update progress without processing this file
				processedCount++;
				const progressPercentage = Math.round((processedCount / totalFiles) * 100);
				setScanProgress(progressPercentage);

				// Continue with next file
				setTimeout(() => {
					processNextFile(index + 1);
				}, 10);
			} else {
				filenameMap.set(fileName, filePath);

				// Create a reader to get file metadata
				const reader = new FileReader();
				reader.onload = (event: ProgressEvent<FileReader>) => {
					const content = (event.target?.result as string) || '';

					// Extract dimensions (this would be done by parsing SVG in real implementation)
					// Here we just simulate it
					const dimensions = estimateSvgDimensions(content);

					// Create icon object
					const iconObject: IconObject = {
						name: fileName,
						folder: folderPath,
						size: formatFileSize(file.size),
						dimensions,
						path: filePath,
						content,
						selected: false,
					};

					// Add to processed icons
					processedIcons.push(iconObject);

					// Add log entry
					setScanLog((prevLogs) => [
						...prevLogs,
						{
							type: 'success',
							message: `Collected: ${fileName}`,
							details: `from ${folderPath}`,
						},
					]);

					// Update progress
					processedCount++;
					const progressPercentage = Math.round((processedCount / totalFiles) * 100);
					setScanProgress(progressPercentage);

					// Process next file
					setTimeout(() => {
						processNextFile(index + 1);
					}, 10); // Small delay to not block UI
				};

				reader.onerror = () => {
					// Handle error
					setScanLog((prevLogs) => [
						...prevLogs,
						{
							type: 'error',
							message: `Failed to read: ${fileName}`,
							details: `in ${folderPath}`,
						},
					]);

					processedCount++;
					const progressPercentage = Math.round((processedCount / totalFiles) * 100);
					setScanProgress(progressPercentage);

					// Continue with next file despite error
					setTimeout(() => {
						processNextFile(index + 1);
					}, 10);
				};

				// Start reading file as text to get SVG content
				reader.readAsText(file);
			}
		};

		// Start processing the first file
		processNextFile(0);
	};

	// Helper function to format file size
	const formatFileSize = (bytes: number): string => {
		if (bytes < 1024) return bytes + 'B';
		if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'KB';
		return (bytes / 1048576).toFixed(1) + 'MB';
	};

	// Helper function to estimate SVG dimensions (simulated)
	const estimateSvgDimensions = (svgContent: string): string => {
		// In a real implementation, parse the SVG to extract width/height or viewBox
		// For demo purposes, just return random dimensions that look realistic
		const sizes = ['16x16', '24x24', '32x32', '48x48'];
		return sizes[Math.floor(Math.random() * sizes.length)];
	};

	// Add function to handle icon selection
	const toggleIconSelection = (index: number) => {
		setConsolidatedIcons((prevIcons) =>
			prevIcons.map((icon, i) => (i === index ? { ...icon, selected: !icon.selected } : icon))
		);
	};

	// Add functions to handle bulk selection
	const selectAllIcons = () => {
		setConsolidatedIcons((prevIcons) => prevIcons.map((icon) => ({ ...icon, selected: true })));
	};

	const clearIconSelection = () => {
		setConsolidatedIcons((prevIcons) => prevIcons.map((icon) => ({ ...icon, selected: false })));
	};

	// Calculate number of selected icons
	const selectedIconsCount = consolidatedIcons.filter((icon) => icon.selected).length;

	// Add helper to toggle export options
	const toggleExportOption = (option: keyof typeof exportOptions) => {
		setExportOptions((prev) => ({
			...prev,
			[option]: !prev[option],
			// Handle mutually exclusive options
			...(option === 'preserveFolderStructure' && !prev.preserveFolderStructure ? { flatOutput: false } : {}),
			...(option === 'flatOutput' && !prev.flatOutput ? { preserveFolderStructure: false } : {}),
		}));
	};

	// Update the process icons function to update processed results
	const processIcons = () => {
		// Demo progress animation
		let progress = 0;
		const interval = setInterval(() => {
			progress += 5;
			setProcessProgress(progress);
			if (progress >= 100) {
				clearInterval(interval);

				// Calculate and update processed results
				const enabledFeatures = Object.entries(processingFeatures)
					.filter(([_, enabled]) => enabled)
					.map(([feature, _]) => feature);

				// Format features for display
				const featuresFormatted = [];
				if (processingFeatures.colorization) featuresFormatted.push('Colorization');
				if (processingFeatures.standardization) featuresFormatted.push('Standardization');
				if (processingFeatures.optimization) featuresFormatted.push('Optimization');

				// Calculate total size (simulated)
				const selectedIcons = consolidatedIcons.filter((icon) => icon.selected);
				const totalSizeInBytes = selectedIcons.reduce((sum, icon) => {
					// Extract size in KB and convert back to bytes for calculation
					const sizeStr = icon.size;
					const sizeNum = parseFloat(sizeStr);
					if (sizeStr.includes('KB')) {
						return sum + sizeNum * 1024;
					} else if (sizeStr.includes('MB')) {
						return sum + sizeNum * 1024 * 1024;
					}
					return sum + sizeNum;
				}, 0);

				// Simulate size reduction from optimization
				const optimizedSize = processingFeatures.optimization
					? totalSizeInBytes * 0.7 // Assume 30% reduction from optimization
					: totalSizeInBytes;

				// Format the size for display
				const formattedSize = formatFileSize(optimizedSize);

				setProcessedResults({
					processedCount: selectedIconsCount,
					featuresApplied: featuresFormatted,
					totalSize: formattedSize,
				});

				toast.success(`Successfully processed ${selectedIconsCount} icons`);

				setTimeout(() => setActiveStep('export'), 500);
			}
		}, 100);
	};

	// Add function to generate JSON manifest
	const generateJsonManifest = () => {
		const selectedIcons = consolidatedIcons.filter((icon) => icon.selected);
		const manifest: { icons: Record<string, any> } = {
			icons: {},
		};

		selectedIcons.forEach((icon) => {
			const iconName = icon.name.replace('.svg', '');
			const dimensions = icon.dimensions.split('x');
			manifest.icons[iconName] = {
				path: `${exportOptions.preserveFolderStructure ? icon.folder + '/' : ''}${icon.name}`,
				width: parseInt(dimensions[0], 10),
				height: parseInt(dimensions[1], 10),
			};
		});

		return JSON.stringify(manifest, null, 2);
	};

	// Add function to generate TypeScript types
	const generateTypeScriptTypes = () => {
		const selectedIcons = consolidatedIcons.filter((icon) => icon.selected);
		let typeContent = 'export const IconNames = {\n';

		selectedIcons.forEach((icon) => {
			const iconName = icon.name.replace('.svg', '');
			const camelCaseName = iconName.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
			typeContent += `  ${camelCaseName}: "${iconName}",\n`;
		});

		typeContent += '} as const;\n\n';
		typeContent += 'export type IconName = keyof typeof IconNames;\n';

		return typeContent;
	};

	// Add function to download individual files
	const downloadIndividualFiles = () => {
		const selectedIcons = consolidatedIcons.filter((icon) => icon.selected);
		if (selectedIcons.length === 0) {
			toast.error('No icons selected for export');
			return;
		}

		// Create a zip for individual files
		const zip = new JSZip();
		const rootFolder = zip.folder('icons');

		if (!rootFolder) {
			toast.error('Failed to create zip folder');
			return;
		}

		// Add each icon to the zip
		selectedIcons.forEach((icon) => {
			const folderPath = exportOptions.preserveFolderStructure ? icon.folder : '';
			const targetFolder = folderPath ? rootFolder.folder(folderPath) : rootFolder;

			if (!targetFolder) {
				toast.error(`Failed to create folder for ${icon.name}`);
				return;
			}

			// Add the SVG content
			targetFolder.file(icon.name, icon.content);
		});

		// Add manifest files if selected
		if (exportOptions.includeJson) {
			rootFolder.file('icon-manifest.json', generateJsonManifest());
		}

		if (exportOptions.includeTypescript) {
			rootFolder.file('icon-types.ts', generateTypeScriptTypes());
		}

		// Generate and download the zip
		zip.generateAsync({ type: 'blob' }).then((content) => {
			saveAs(content, 'icons-individual.zip');
			toast.success('Icons exported successfully!');
		});
	};

	// Add function to download as a package
	const downloadZipPackage = () => {
		const selectedIcons = consolidatedIcons.filter((icon) => icon.selected);
		if (selectedIcons.length === 0) {
			toast.error('No icons selected for export');
			return;
		}

		// Create a zip for the package
		const zip = new JSZip();
		const rootFolder = zip.folder('icons-package');

		if (!rootFolder) {
			toast.error('Failed to create zip folder');
			return;
		}

		// Create combined SVG file
		let combinedSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n`;

		// Add each icon to the zip and to the combined SVG
		selectedIcons.forEach((icon) => {
			const iconName = icon.name.replace('.svg', '');
			const folderPath = exportOptions.preserveFolderStructure ? icon.folder : '';
			const targetFolder = folderPath ? rootFolder.folder(folderPath) : rootFolder;

			if (!targetFolder) {
				toast.error(`Failed to create folder for ${icon.name}`);
				return;
			}

			// Add the SVG file
			targetFolder.file(icon.name, icon.content);

			// Extract the SVG content for the combined file
			// This is a simplified implementation; in a real app, you'd properly parse the SVG
			const svgContent = icon.content
				.replace(/<\?xml.*?\?>/, '')
				.replace(/<svg[^>]*>/, `<symbol id="${iconName}">`)
				.replace(/<\/svg>/, '</symbol>');

			combinedSvgContent += `  ${svgContent}\n`;
		});

		combinedSvgContent += `</svg>`;

		// Add the combined SVG to the root
		rootFolder.file('icons-sprite.svg', combinedSvgContent);

		// Add manifest files if selected
		if (exportOptions.includeJson) {
			rootFolder.file('icon-manifest.json', generateJsonManifest());
		}

		if (exportOptions.includeTypescript) {
			rootFolder.file('icon-types.ts', generateTypeScriptTypes());
		}

		// Generate and download the zip
		zip.generateAsync({ type: 'blob' }).then((content) => {
			saveAs(content, 'icons-package.zip');
			toast.success('ZIP package downloaded successfully!');
		});
	};

	// Function to download all files in one click
	const downloadAllFiles = () => {
		const selectedIcons = consolidatedIcons.filter((icon) => icon.selected);
		if (selectedIcons.length === 0) {
			toast.error('No icons selected for export');
			return;
		}

		downloadZipPackage();
	};

	return (
		<div className='sm:p-8 p-4 bg-secondary min-h-screen'>
			<div className='flex justify-between items-center'>
				<div>
					<h2 className='text-2xl font-bold'>SVG Icon Management System</h2>
					<p className='text-muted-foreground'>Collect, visualize and process SVG icons</p>
				</div>
				<div className='flex gap-2'>
					<Button
						variant={activeStep === 'collection' ? 'default' : 'outline'}
						onClick={() => setActiveStep('collection')}>
						1. Collection
					</Button>
					<Button
						variant={activeStep === 'display' ? 'default' : 'outline'}
						onClick={() => setActiveStep('display')}
						disabled={collectionStats.totalFiles === 0}>
						2. Display
					</Button>
					<Button
						variant={activeStep === 'processing' ? 'default' : 'outline'}
						onClick={() => setActiveStep('processing')}
						disabled={collectionStats.totalFiles === 0}>
						3. Processing
					</Button>
					<Button
						variant={activeStep === 'export' ? 'default' : 'outline'}
						onClick={() => setActiveStep('export')}
						disabled={collectionStats.totalFiles === 0}>
						4. Export
					</Button>
				</div>
			</div>

			{/* Step 1: Collection */}
			{activeStep === 'collection' && (
				<Card>
					<CardHeader>
						<CardTitle>Icon Collection</CardTitle>
						<CardDescription>Select a folder containing SVG icons to scan</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-3'>
								<Label htmlFor='folder-input'>Root Folder</Label>
								<div
									onClick={handleFolderSelect}
									className='border-2 border-dashed rounded-md p-6 hover:border-primary cursor-pointer flex flex-col items-center justify-center text-center'>
									<FolderUp className='h-8 w-8 text-muted-foreground mb-2' />
									<p className='font-medium'>Click to select folder</p>
									<p className='text-xs text-muted-foreground mt-1'>or drag and drop folder here</p>
									<input
										ref={fileInputRef}
										id='folder-input'
										type='file'
										className='hidden'
										// @ts-ignore - webkitdirectory exists in Chrome but not in type definitions
										webkitdirectory=''
										directory=''
										onChange={handleFilesSelected}
									/>
								</div>
								<p className='text-xs text-muted-foreground'>
									System will scan all subfolders for SVG files and consolidate them
								</p>
							</div>

							<div className='border rounded-md p-4'>
								<h3 className='font-medium mb-3'>Collection Statistics</h3>
								<div className='grid grid-cols-2 gap-3 text-sm'>
									<div className='flex items-center gap-1.5'>
										<FileUp className='h-4 w-4 text-muted-foreground' />
										<span>Total Files:</span>
									</div>
									<div className='font-medium'>{collectionStats.totalFiles}</div>

									<div className='flex items-center gap-1.5'>
										<FolderUp className='h-4 w-4 text-muted-foreground' />
										<span>Total Folders:</span>
									</div>
									<div className='font-medium'>{collectionStats.totalFolders}</div>

									<div className='flex items-center gap-1.5'>
										<AlertTriangle className='h-4 w-4 text-amber-500' />
										<span>Duplicates:</span>
									</div>
									<div className='font-medium'>{collectionStats.duplicates}</div>

									<div className='flex items-center gap-1.5'>
										<AlertCircle className='h-4 w-4 text-red-500' />
										<span>Errors:</span>
									</div>
									<div className='font-medium'>{collectionStats.errors}</div>
								</div>
							</div>
						</div>

						{/* Scan Progress */}
						{scanProgress > 0 && (
							<div className='space-y-2'>
								<div className='flex justify-between text-sm'>
									<span>{isScanning ? 'Scanning files...' : 'Scan complete'}</span>
									<span>{scanProgress}%</span>
								</div>
								<Progress value={scanProgress} />
							</div>
						)}

						{/* Scan Log */}
						{scanLog.length > 0 && (
							<div className='border rounded-md p-2 max-h-[200px] overflow-y-auto'>
								<h3 className='text-sm font-medium px-2 py-1'>Scan Log</h3>
								<div className='space-y-1'>
									{scanLog.slice(-5).map((log, index) => (
										<div
											key={index}
											className='text-xs border-t px-2 py-1.5 flex items-start gap-2'>
											{log.type === 'success' && (
												<CheckCircle className='h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5' />
											)}
											{log.type === 'warning' && (
												<AlertTriangle className='h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5' />
											)}
											{log.type === 'error' && (
												<AlertCircle className='h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5' />
											)}
											<div>
												<div>{log.message}</div>
												{log.details && <div className='text-muted-foreground'>{log.details}</div>}
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						<div className='flex justify-end gap-2'>
							<Button
								disabled={isScanning}
								onClick={handleFolderSelect}>
								Select Folder
							</Button>
							<Button
								disabled={isScanning || collectionStats.totalFiles > 0}
								onClick={() => {
									// Demo progress animation for when we don't have real folder selection
									setIsScanning(true);

									let progress = 0;
									const mockFiles = [];
									for (let i = 0; i < 20; i++) {
										mockFiles.push({
											name: `icon-${i}.svg`,
											webkitRelativePath: `icons/category-${Math.floor(i / 5)}/icon-${i}.svg`,
											size: Math.floor(Math.random() * 5000) + 500,
										});
									}

									// Add duplicate to demonstrate handling
									mockFiles.push({
										name: 'icon-5.svg',
										webkitRelativePath: 'icons/duplicates/icon-5.svg',
										size: 1240,
									});

									const interval = setInterval(() => {
										progress += 2;
										setScanProgress(progress);

										if (progress % 10 === 0) {
											const fileName = `mock-icon-${progress / 2}.svg`;
											const folderName = `mock/folder-${Math.floor(progress / 20)}`;

											setScanLog((prevLogs) => [
												...prevLogs,
												{
													type: 'success',
													message: `Collected: ${fileName}`,
													details: `from ${folderName}`,
												},
											]);
										}

										if (progress >= 100) {
											clearInterval(interval);
											setIsScanning(false);
											setCollectionStats({
												totalFiles: 50,
												totalFolders: 8,
												duplicates: 3,
												errors: 1,
											});

											toast.success('Successfully collected 50 icons');

											setTimeout(() => {
												setActiveStep('display');
											}, 1000);
										}
									}, 50);
								}}>
								Demo Collection
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Step 2: Display */}
			{activeStep === 'display' && (
				<Card>
					<CardHeader>
						<div className='flex justify-between items-center'>
							<div>
								<CardTitle>Icon Gallery</CardTitle>
								<CardDescription>Browse and select icons for processing</CardDescription>
							</div>

							{/* Add processing button at the top */}
							{consolidatedIcons.length > 0 && (
								<Button
									onClick={() => setActiveStep('processing')}
									disabled={selectedIconsCount === 0}
									className='ml-auto'>
									Process {selectedIconsCount > 0 ? `${selectedIconsCount} Selected` : 'Icons'} →
								</Button>
							)}
						</div>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='flex justify-between'>
							<div className='relative w-64'>
								<Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
								<Input
									placeholder='Search icons...'
									className='pl-8'
								/>
							</div>
							<div className='flex gap-2'>
								<Button
									variant='outline'
									size='sm'
									onClick={selectAllIcons}
									disabled={consolidatedIcons.length === 0}>
									Select All
								</Button>
								<Button
									variant='outline'
									size='sm'
									onClick={clearIconSelection}
									disabled={selectedIconsCount === 0}>
									Clear Selection
								</Button>
								{selectedIconsCount > 0 && <Badge variant='secondary'>{selectedIconsCount} selected</Badge>}
							</div>
						</div>

						<Tabs defaultValue='all'>
							<TabsList>
								<TabsTrigger value='all'>
									All Icons ({consolidatedIcons.length || collectionStats.totalFiles})
								</TabsTrigger>

								{/* Generate folder-based tabs dynamically */}
								{Array.from(
									new Set(
										consolidatedIcons.map((icon) => {
											const parts = icon.folder.split('/');
											return parts.length > 0 ? parts[0] : 'Other';
										})
									)
								).map((folder) => (
									<TabsTrigger
										key={folder}
										value={folder}>
										{folder}
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>

						<div className='grid grid-cols-4 gap-4'>
							{/* Show actual consolidated icons if available, otherwise use mock icons for demo */}
							{(consolidatedIcons.length > 0 ? consolidatedIcons : mockIcons).map((icon, index) => (
								<div
									key={index}
									className={`border rounded-md p-3 hover:border-primary cursor-pointer transition-all ${
										icon.selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''
									}`}
									onClick={() => toggleIconSelection(index)}>
									<div className='relative w-full h-24 bg-secondary/30 rounded flex items-center justify-center mb-2'>
										{/* Show selection indicator */}
										{icon.selected && (
											<div className='absolute top-2 right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center'>
												<CheckCircle className='w-4 h-4' />
											</div>
										)}

										{/* Show actual SVG preview if available */}
										{icon.content ? (
											<div
												className='w-10 h-10'
												dangerouslySetInnerHTML={{ __html: icon.content }}
											/>
										) : (
											<div className='w-6 h-6 bg-gray-400 rounded'></div>
										)}
									</div>
									<div className='flex justify-between items-start'>
										<div>
											<p className='font-medium text-sm truncate'>{icon.name}</p>
											<p className='text-xs text-muted-foreground'>{icon.dimensions}</p>
										</div>
										<Badge
											variant='outline'
											className='text-xs'>
											{icon.size}
										</Badge>
									</div>
									<p className='text-xs text-muted-foreground truncate mt-1'>{icon.folder}</p>
								</div>
							))}

							{/* Show empty message if no icons */}
							{consolidatedIcons.length === 0 && mockIcons.length === 0 && (
								<div className='col-span-4 text-center py-8'>
									<FolderUp className='h-10 w-10 text-muted-foreground mx-auto mb-2' />
									<p>No icons available. Start by collecting icons in the previous step.</p>
								</div>
							)}
						</div>

						<div className='flex justify-end'>
							<Button
								variant='outline'
								onClick={() => setActiveStep('collection')}>
								Back to Collection
							</Button>
							<Button
								className='ml-2'
								onClick={() => setActiveStep('processing')}
								disabled={consolidatedIcons.length === 0 && collectionStats.totalFiles === 0}>
								Proceed to Processing
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Step 3: Processing */}
			{activeStep === 'processing' && (
				<Card>
					<CardHeader>
						<CardTitle>Icon Processing</CardTitle>
						<CardDescription>Apply transformations to selected icons</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid grid-cols-2 gap-6'>
							<div className='space-y-4'>
								<h3 className='font-medium'>Processing Features</h3>

								<div className='space-y-3 border rounded-md p-3'>
									<div className='flex justify-between items-center'>
										<div>
											<Label
												htmlFor='colorization'
												className='text-base'>
												Colorization
											</Label>
											<p className='text-xs text-muted-foreground'>Enable dynamic theming with currentColor</p>
										</div>
										<Switch
											id='colorization'
											checked={processingFeatures.colorization}
											onCheckedChange={() => toggleProcessingFeature('colorization')}
										/>
									</div>

									<div className='pl-5 space-y-2'>
										<div className='flex items-center space-x-2'>
											<Switch
												id='replace-black'
												checked={processingFeatures.replaceBlack}
												onCheckedChange={() => toggleProcessingFeature('replaceBlack')}
												disabled={!processingFeatures.colorization}
											/>
											<Label
												htmlFor='replace-black'
												className={`text-sm ${!processingFeatures.colorization ? 'text-muted-foreground' : ''}`}>
												Replace black fills
											</Label>
										</div>
										<div className='flex items-center space-x-2'>
											<Switch
												id='preserve-none'
												checked={processingFeatures.preserveNone}
												onCheckedChange={() => toggleProcessingFeature('preserveNone')}
												disabled={!processingFeatures.colorization}
											/>
											<Label
												htmlFor='preserve-none'
												className={`text-sm ${!processingFeatures.colorization ? 'text-muted-foreground' : ''}`}>
												Preserve fill="none"
											</Label>
										</div>
										<div className='flex items-center space-x-2'>
											<Switch
												id='remove-white-bg'
												checked={processingFeatures.removeWhiteBg}
												onCheckedChange={() => toggleProcessingFeature('removeWhiteBg')}
												disabled={!processingFeatures.colorization}
											/>
											<Label
												htmlFor='remove-white-bg'
												className={`text-sm ${!processingFeatures.colorization ? 'text-muted-foreground' : ''}`}>
												Remove white backgrounds
											</Label>
										</div>
										<div className='flex items-center space-x-2'>
											<Switch
												id='add-root-fill'
												checked={processingFeatures.addRootFill}
												onCheckedChange={() => toggleProcessingFeature('addRootFill')}
												disabled={!processingFeatures.colorization}
											/>
											<Label
												htmlFor='add-root-fill'
												className={`text-sm ${!processingFeatures.colorization ? 'text-muted-foreground' : ''}`}>
												Add fill to root elements
											</Label>
										</div>
									</div>
								</div>

								<div className='space-y-3 border rounded-md p-3'>
									<div className='flex justify-between items-center'>
										<div>
											<Label
												htmlFor='standardization'
												className='text-base'>
												Format Standardization
											</Label>
											<p className='text-xs text-muted-foreground'>Normalize naming and structure</p>
										</div>
										<Switch
											id='standardization'
											checked={processingFeatures.standardization}
											onCheckedChange={() => toggleProcessingFeature('standardization')}
										/>
									</div>

									<div className='pl-5 space-y-2'>
										<div className='flex items-center space-x-2'>
											<Switch
												id='kebab-case'
												checked={processingFeatures.kebabCase}
												onCheckedChange={() => toggleProcessingFeature('kebabCase')}
												disabled={!processingFeatures.standardization}
											/>
											<Label
												htmlFor='kebab-case'
												className={`text-sm ${!processingFeatures.standardization ? 'text-muted-foreground' : ''}`}>
												Convert to kebab-case
											</Label>
										</div>
										<div className='flex items-center space-x-2'>
											<Switch
												id='prefix'
												checked={processingFeatures.addPrefix}
												onCheckedChange={() => toggleProcessingFeature('addPrefix')}
												disabled={!processingFeatures.standardization}
											/>
											<Label
												htmlFor='prefix'
												className={`text-sm ${!processingFeatures.standardization ? 'text-muted-foreground' : ''}`}>
												Add prefix
											</Label>
										</div>
										<div className='flex items-center space-x-2 pl-5'>
											<Input
												placeholder='icon-'
												disabled={!processingFeatures.standardization || !processingFeatures.addPrefix}
												className='h-8 w-32'
											/>
										</div>
									</div>
								</div>

								<div className='space-y-3 border rounded-md p-3'>
									<div className='flex justify-between items-center'>
										<div>
											<Label
												htmlFor='optimization'
												className='text-base'>
												Optimization
											</Label>
											<p className='text-xs text-muted-foreground'>Reduce file size</p>
										</div>
										<Switch
											id='optimization'
											checked={processingFeatures.optimization}
											onCheckedChange={() => toggleProcessingFeature('optimization')}
										/>
									</div>
								</div>
							</div>

							<div className='space-y-4'>
								<h3 className='font-medium'>Preview & Queue</h3>

								<div className='border rounded-md p-3 h-[250px] flex items-center justify-center'>
									{/* Display preview of a selected icon if available */}
									{consolidatedIcons.filter((icon) => icon.selected).length > 0 ? (
										<div className='text-center'>
											<div
												className='w-16 h-16 mx-auto mb-2'
												dangerouslySetInnerHTML={{
													__html: consolidatedIcons.find((icon) => icon.selected)?.content || '',
												}}
											/>
											<p className='text-sm font-medium'>{consolidatedIcons.find((icon) => icon.selected)?.name}</p>
											<p className='text-xs text-muted-foreground'>Preview with currentColor applied</p>
										</div>
									) : (
										<div className='text-center'>
											<div className='w-16 h-16 bg-gray-200 mx-auto mb-2 rounded'></div>
											<p className='text-sm text-muted-foreground'>Select an icon to preview changes</p>
										</div>
									)}
								</div>

								<div className='border rounded-md p-3'>
									<h4 className='text-sm font-medium mb-2'>Processing Queue</h4>
									{selectedIconsCount > 0 ? (
										<div className='text-sm'>{selectedIconsCount} icons selected for processing</div>
									) : (
										<div className='text-sm text-muted-foreground'>No icons selected for processing</div>
									)}

									<div className='space-y-2 mt-3'>
										<div className='flex justify-between text-sm'>
											<span>Processing...</span>
											<span>{processProgress}%</span>
										</div>
										<Progress value={processProgress} />
									</div>
								</div>

								<div className='space-y-2'>
									<div className='flex items-center space-x-2'>
										<Switch
											id='dry-run'
											checked={dryRun}
											onCheckedChange={setDryRun}
										/>
										<div>
											<Label
												htmlFor='dry-run'
												className='text-sm'>
												Dry Run Mode
											</Label>
											<p className='text-xs text-muted-foreground'>Preview changes without modifying files</p>
										</div>
									</div>
								</div>

								<Button
									className='w-full'
									onClick={processIcons}
									disabled={selectedIconsCount === 0}>
									Process {selectedIconsCount} Icons
								</Button>
							</div>
						</div>

						<div className='flex justify-between mt-4'>
							<Button
								variant='outline'
								onClick={() => setActiveStep('display')}>
								Back to Gallery
							</Button>
							<Button
								variant='outline'
								onClick={() => setActiveStep('export')}>
								Skip to Export
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Step 4: Export */}
			{activeStep === 'export' && (
				<Card>
					<CardHeader>
						<div className='flex justify-between items-center'>
							<div>
								<CardTitle>Export Icons</CardTitle>
								<CardDescription>Download processed icons and manifest</CardDescription>
							</div>

							<Button
								size='lg'
								className='gap-2'
								onClick={downloadAllFiles}>
								<DownloadIcon size={18} />
								Download Package
							</Button>
						</div>
					</CardHeader>
					<CardContent className='space-y-6'>
						<div className='grid grid-cols-2 gap-6'>
							<div className='space-y-4'>
								<h3 className='font-medium'>Export Options</h3>

								<div className='space-y-3 border rounded-md p-3'>
									<div className='flex items-center space-x-3 mb-3'>
										<Switch
											id='include-json'
											checked={exportOptions.includeJson}
											onCheckedChange={() => toggleExportOption('includeJson')}
										/>
										<div>
											<Label
												htmlFor='include-json'
												className='text-sm'>
												Include JSON Manifest
											</Label>
											<p className='text-xs text-muted-foreground'>Generate icon paths and metadata</p>
										</div>
									</div>

									{exportOptions.includeJson && (
										<div className='ml-8 mb-3 border-l-2 pl-3 text-xs font-mono text-muted-foreground'>
											<pre className='whitespace-pre-wrap'>
												{`{
  "icons": {
    ${consolidatedIcons
			.filter((icon) => icon.selected)
			.slice(0, 3)
			.map(
				(icon) =>
					`"${icon.name.replace('.svg', '')}": {
      "path": "${icon.folder}/${icon.name}",
      "width": ${icon.dimensions.split('x')[0]},
      "height": ${icon.dimensions.split('x')[1]}
    }`
			)
			.join(',\n    ')}${consolidatedIcons.filter((icon) => icon.selected).length > 3 ? ',\n    // ... more icons' : ''}
  }
}`}
											</pre>
										</div>
									)}

									<div className='flex items-center space-x-3'>
										<Switch
											id='include-typescript'
											checked={exportOptions.includeTypescript}
											onCheckedChange={() => toggleExportOption('includeTypescript')}
										/>
										<div>
											<Label
												htmlFor='include-typescript'
												className='text-sm'>
												Include TypeScript Types
											</Label>
											<p className='text-xs text-muted-foreground'>Generate icon name constants and types</p>
										</div>
									</div>

									{exportOptions.includeTypescript && (
										<div className='ml-8 border-l-2 pl-3 text-xs font-mono text-muted-foreground'>
											<pre className='whitespace-pre-wrap'>
												{`export const IconNames = {
  ${consolidatedIcons
		.filter((icon) => icon.selected)
		.slice(0, 3)
		.map(
			(icon) =>
				`${icon.name.replace('.svg', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase())}: "${icon.name.replace(
					'.svg',
					''
				)}"`
		)
		.join(',\n  ')}${consolidatedIcons.filter((icon) => icon.selected).length > 3 ? ',\n  // ... more icons' : ''}
} as const;

export type IconName = keyof typeof IconNames;`}
											</pre>
										</div>
									)}
								</div>

								<div className='space-y-3 border rounded-md p-3'>
									<div className='flex items-center space-x-3 mb-3'>
										<Switch
											id='folder-structure'
											checked={exportOptions.preserveFolderStructure}
											onCheckedChange={() => toggleExportOption('preserveFolderStructure')}
											disabled={exportOptions.flatOutput}
										/>
										<div>
											<Label
												htmlFor='folder-structure'
												className='text-sm'>
												Preserve Folder Structure
											</Label>
											<p className='text-xs text-muted-foreground'>Maintain original organization</p>
										</div>
									</div>

									<div className='flex items-center space-x-3'>
										<Switch
											id='flat-output'
											checked={exportOptions.flatOutput}
											onCheckedChange={() => toggleExportOption('flatOutput')}
											disabled={exportOptions.preserveFolderStructure}
										/>
										<div>
											<Label
												htmlFor='flat-output'
												className='text-sm'>
												Flat Output
											</Label>
											<p className='text-xs text-muted-foreground'>All icons in a single directory</p>
										</div>
									</div>
								</div>
							</div>

							<div className='space-y-4'>
								<h3 className='font-medium'>Output Preview</h3>

								<div className='border rounded-md p-3 h-[240px] overflow-auto bg-muted/10'>
									<div className='text-xs font-mono'>
										{exportOptions.preserveFolderStructure ? (
											<>
												<div className='flex items-center text-primary'>
													<FolderIcon
														size={16}
														className='mr-1'
													/>{' '}
													icons/
												</div>
												{Array.from(
													new Set(
														consolidatedIcons
															.filter((icon) => icon.selected)
															.map((icon) => {
																const parts = icon.folder.split('/');
																return parts[0] || 'other';
															})
													)
												).map((folder, i) => (
													<div
														key={i}
														className='ml-4 mt-1'>
														<div className='flex items-center text-primary'>
															<FolderIcon
																size={16}
																className='mr-1'
															/>{' '}
															{folder}/
														</div>
														{consolidatedIcons
															.filter((icon) => icon.selected && icon.folder.startsWith(folder))
															.slice(0, 3)
															.map((icon, j) => (
																<div
																	key={j}
																	className='ml-4 flex items-center text-muted-foreground'>
																	<FileIcon
																		size={14}
																		className='mr-1'
																	/>{' '}
																	{icon.name}
																</div>
															))}
														{consolidatedIcons.filter((icon) => icon.selected && icon.folder.startsWith(folder))
															.length > 3 && <div className='ml-4 text-muted-foreground'>... more files</div>}
													</div>
												))}
											</>
										) : (
											<>
												<div className='flex items-center text-primary'>
													<FolderIcon
														size={16}
														className='mr-1'
													/>{' '}
													icons/
												</div>
												{consolidatedIcons
													.filter((icon) => icon.selected)
													.slice(0, 8)
													.map((icon, i) => (
														<div
															key={i}
															className='ml-4 flex items-center text-muted-foreground'>
															<FileIcon
																size={14}
																className='mr-1'
															/>{' '}
															{icon.name}
														</div>
													))}
												{consolidatedIcons.filter((icon) => icon.selected).length > 8 && (
													<div className='ml-4 text-muted-foreground'>... more files</div>
												)}
											</>
										)}

										{exportOptions.includeJson && (
											<div className='ml-4 flex items-center mt-1 text-muted-foreground'>
												<FileIcon
													size={14}
													className='mr-1'
												/>{' '}
												icon-manifest.json
											</div>
										)}

										{exportOptions.includeTypescript && (
											<div className='ml-4 flex items-center text-muted-foreground'>
												<FileIcon
													size={14}
													className='mr-1'
												/>{' '}
												icon-types.ts
											</div>
										)}
									</div>
								</div>

								<div className='space-y-2 border rounded-md p-3 bg-muted/10'>
									<div className='flex justify-between'>
										<span className='text-sm'>Icons Processed:</span>
										<span className='text-sm font-medium'>{processedResults.processedCount}</span>
									</div>
									<div className='flex justify-between'>
										<span className='text-sm'>Processing Features:</span>
										<span className='text-sm font-medium'>{processedResults.featuresApplied.length}</span>
									</div>
									<div className='flex items-start justify-between'>
										<span className='text-sm'>Applied Features:</span>
										<span className='text-sm font-medium text-right'>
											{processedResults.featuresApplied.join(', ') || 'None'}
										</span>
									</div>
									<div className='flex justify-between'>
										<span className='text-sm'>Total Output Size:</span>
										<span className='text-sm font-medium'>{processedResults.totalSize}</span>
									</div>
								</div>

								<div className='flex gap-2'>
									<Button
										variant='outline'
										className='flex-1 gap-1'
										onClick={downloadIndividualFiles}>
										<FileIcon size={14} />
										Individual Files
									</Button>
									<Button
										className='flex-1 gap-1'
										onClick={downloadZipPackage}>
										<ArchiveIcon size={14} />
										ZIP Package
									</Button>
								</div>
							</div>
						</div>

						<div className='flex justify-between mt-4'>
							<Button
								variant='outline'
								onClick={() => setActiveStep('processing')}>
								Back to Processing
							</Button>
							<Button
								variant='outline'
								onClick={() => {
									setActiveStep('collection');
									setScanProgress(0);
									setProcessProgress(0);
									setCollectionStats({
										totalFiles: 0,
										totalFolders: 0,
										duplicates: 0,
										errors: 0,
									});
									setConsolidatedIcons([]);
								}}>
								Start New Collection
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default IconManagementSystem;
