'use client';
import React, { useState, useRef } from 'react';
import IconCollection from './IconCollection';
import IconDisplay from './IconDisplay';
import IconProcessing from './IconProcessing';
import IconExport from './IconExport';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { CheckIcon, ArrowRightIcon, ArrowLeftIcon, DownloadIcon } from 'lucide-react';

import {
	CollectionStats,
	IconObject,
	ScanLogEntry,
	ProcessingFeature,
	ProcessingFeatures,
	ProcessedResults,
	ExportOptions,
} from '../../../../types/icon-helper-types';
import { generateIconSense } from '@/lib/icon-sense';

// Steps configuration for better visualization
const STEPS = [
	{ id: 'collection', label: 'Collection', description: 'Import and manage SVG files' },
	{ id: 'processing', label: 'Processing', description: 'Apply transformations' },
	{ id: 'export', label: 'Export', description: 'Download processed icons' },
];

// Batch processing configuration
let BATCH_SIZE = 500;
let BATCH_DELAY_MS = 1000; // 1 second delay between batches

const IconManager = () => {
	const [activeStep, setActiveStep] = useState('collection');
	const [scanProgress, setScanProgress] = useState(0);
	const [processProgress, setProcessProgress] = useState(0);
	const [isProcessing, setIsProcessing] = useState(false);
	const [collectionStats, setCollectionStats] = useState<CollectionStats>({
		totalFiles: 0,
		totalFolders: 0,
		duplicates: 0,
		errors: 0,
		uniqueTags: 0,
	});
	const [isScanning, setIsScanning] = useState(false);
	const [consolidatedIcons, setConsolidatedIcons] = useState<IconObject[]>([]);
	const [scanLog, setScanLog] = useState<ScanLogEntry[]>([]);
	const [batchProcessing, setBatchProcessing] = useState({
		batchSize: BATCH_SIZE,
		batchDelay: BATCH_DELAY_MS,
	});

	// Add state for batch processing info
	const [batchInfo, setBatchInfo] = useState<{
		currentBatch: number;
		totalBatches: number;
		batchProgress: number;
	}>({
		currentBatch: 0,
		totalBatches: 0,
		batchProgress: 0,
	});

	// Add state for processing features
	const [processingFeatures, setProcessingFeatures] = useState<ProcessingFeatures>({
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

		// Icon Sense feature
		iconSense: true,
		nameSense: false,
		tagSense: false,
	});

	// Add state for export options
	const [exportOptions, setExportOptions] = useState<ExportOptions>({
		includeJson: true,
		includeTypescript: true,
		flatOutput: false,
		includeTags: true,
	});

	// Add state for processed results
	const [processedResults, setProcessedResults] = useState<ProcessedResults>({
		processedCount: 0,
		featuresApplied: [],
		totalSize: '0KB',
	});

	// Add state for custom prefix
	const [customPrefix, setCustomPrefix] = useState<string>('icon-');

	// Get current step index for progress indicator
	const currentStepIndex = STEPS.findIndex((step) => step.id === activeStep);

	// Check if current step is complete based on conditions
	const isStepComplete = (stepId: string) => {
		switch (stepId) {
			case 'collection':
				return collectionStats.totalFiles > 0;
			case 'processing':
				return consolidatedIcons.some((icon) => icon.selected) && processedResults.processedCount > 0;
			case 'export':
				return false; // Export is the final step
			default:
				return false;
		}
	};

	// Add handler for toggling processing features
	const toggleProcessingFeature = (feature: ProcessingFeature) => {
		console.log('toggleProcessingFeature', feature);

		setProcessingFeatures((prev) => {
			const updated = { ...prev };

			// Toggle the feature
			updated[feature] = !prev[feature];

			// Handle parent-child relationships
			if (feature === 'colorization') {
				if (!updated.colorization) {
					// If disabling colorization, disable all children
					updated.replaceBlack = false;
					updated.preserveNone = false;
					updated.removeWhiteBg = false;
					updated.addRootFill = false;
				}
			} else if (feature === 'standardization') {
				if (!updated.standardization) {
					// If disabling standardization, disable all children
					updated.kebabCase = false;
					updated.addPrefix = false;
				}
			}

			// If enabling any child feature, make sure parent is enabled too
			if (['replaceBlack', 'preserveNone', 'removeWhiteBg', 'addRootFill'].includes(feature)) {
				if (updated[feature]) {
					updated.colorization = true;
				}
			} else if (['kebabCase', 'addPrefix'].includes(feature)) {
				if (updated[feature]) {
					updated.standardization = true;
				}
			}

			if (feature === 'iconSense') {
				if (!updated.iconSense) {
					updated.nameSense = false;
					updated.tagSense = false;
				}
			}

			if (feature === 'nameSense') {
				if (updated.nameSense) {
					setBatchProcessing({
						batchSize: 60,
						batchDelay: 60000,
					});
				}
			} else if (feature === 'tagSense') {
				if (updated.tagSense && !updated.nameSense) {
					setBatchProcessing({
						batchSize: 200,
						batchDelay: 2000,
					});
				}
			} else {
				if (updated.nameSense && updated.tagSense) {
					setBatchProcessing({
						batchSize: 500,
						batchDelay: 1000,
					});
				}
			}

			return updated;
		});
	};

	// Add handler for resetting processing features to default
	const resetProcessingFeatures = () => {
		setProcessingFeatures({
			// Colorization features
			colorization: false,
			replaceBlack: false,
			preserveNone: false,
			removeWhiteBg: false,
			addRootFill: false,

			// Standardization features
			standardization: false,
			kebabCase: false,
			addPrefix: false,

			// Optimization feature
			optimization: false,

			// Icon Sense feature
			iconSense: false,
			nameSense: false,
			tagSense: false,
		});
	};

	const toggleIconSelection = (index: number) => {
		setConsolidatedIcons((prev) => prev.map((icon, i) => (i === index ? { ...icon, selected: !icon.selected } : icon)));
	};

	const selectAllIcons = () => {
		setConsolidatedIcons((prev) => prev.map((icon) => ({ ...icon, selected: true })));
	};

	const clearIconSelection = () => {
		setConsolidatedIcons((prev) => prev.map((icon) => ({ ...icon, selected: false })));
	};

	const toggleExportOption = (option: keyof ExportOptions) => {
		setExportOptions((prev) => ({ ...prev, [option]: !prev[option] }));
	};

	// Helper function to split array into batches
	const createBatches = <T,>(array: T[], batchSize: number): T[][] => {
		const batches: T[][] = [];
		for (let i = 0; i < array.length; i += batchSize) {
			batches.push(array.slice(i, i + batchSize));
		}
		return batches;
	};

	// Helper function to process a single batch of icons
	const processBatch = async (iconBatch: IconObject[]): Promise<IconObject[]> => {
		// Process icons sequentially to respect rate limits
		const processedBatch: IconObject[] = [];

		for (const icon of iconBatch) {
			if (!icon.selected) {
				processedBatch.push(icon);
				continue;
			}

			let processedIcon = { ...icon };

			if (processingFeatures.iconSense && (processingFeatures.nameSense || processingFeatures.tagSense)) {
				const needsNameGeneration = processingFeatures.nameSense;
				const needsTagGeneration = processingFeatures.tagSense;

				// Set batch processing based on operation type
				const isImageAnalysis = needsNameGeneration;

				try {
					const iconSense = await generateIconSense(processedIcon, isImageAnalysis);
					if (iconSense) {
						if (needsNameGeneration && iconSense.name) {
							processedIcon.name = `${iconSense.name}.svg`;
						}
						if (needsTagGeneration && iconSense.tags) {
							processedIcon.tags = iconSense.tags;
						}
					}
				} catch (error) {
					console.warn('IconSense processing failed for:', processedIcon.name, error);
				}
			}

			// Apply kebab-case transformation if enabled
			if (processingFeatures.kebabCase && processingFeatures.standardization) {
				// Convert filename to kebab-case
				const filenameParts = processedIcon.name.split('.');
				const extension = filenameParts.pop();
				const basename = filenameParts.join('.');

				// Convert to kebab-case: replace spaces, underscores, and camelCase with hyphens
				const kebabName = basename
					.replace(/([a-z])([A-Z])/g, '$1-$2') // camelCase to kebab-case
					.replace(/[\s_]+/g, '-') // spaces and underscores to hyphens
					.replace(/[^a-zA-Z0-9-]/g, '') // remove special characters
					.toLowerCase()
					.replace(/-+/g, '-') // collapse multiple hyphens
					.replace(/^-|-$/g, '') // trim leading/trailing hyphens
					.replace(/\./g, ''); // remove dots

				processedIcon.name = `${kebabName}.${extension}`;

				// Update the path as well
				const pathParts = processedIcon.path.split('/');
				pathParts[pathParts.length - 1] = processedIcon.name;
				processedIcon.path = pathParts.join('/');
			}

			// Apply prefix if enabled
			if (processingFeatures.addPrefix && processingFeatures.standardization) {
				const prefix = customPrefix || 'icon-';
				if (!processedIcon.name.startsWith(prefix)) {
					const filenameParts = processedIcon.name.split('.');
					const extension = filenameParts.pop();
					const basename = filenameParts.join('.');
					processedIcon.name = `${prefix}${basename}.${extension}`;

					// Update the path as well
					const pathParts = processedIcon.path.split('/');
					pathParts[pathParts.length - 1] = processedIcon.name;
					processedIcon.path = pathParts.join('/');
				}
			}

			// Apply colorization transformations if enabled
			if (processingFeatures.colorization && processedIcon.content) {
				let processedContent = processedIcon.content;

				if (processingFeatures.replaceBlack) {
					// Replace all fills and strokes with currentColor
					processedContent = processedContent
						.replace(/fill="#000000"/g, 'fill="currentColor"')
						.replace(/stroke="#000000"/g, 'stroke="currentColor"')
						.replace(/fill="#000"/g, 'fill="currentColor"')
						.replace(/stroke="#000"/g, 'stroke="currentColor"')
						.replace(/fill="black"/g, 'fill="currentColor"')
						.replace(/stroke="black"/g, 'stroke="currentColor"');
				} else {
					// Replace fill="currentColor" with fill="black"
					processedContent = processedContent.replace(/fill="currentColor"/g, 'fill="black"');
					processedContent = processedContent.replace(/stroke="currentColor"/g, 'stroke="black"');
				}

				if (processingFeatures.removeWhiteBg) {
					// Remove white backgrounds
					processedContent = processedContent
						.replace(/fill="#ffffff"/g, 'fill="none"')
						.replace(/fill="#fff"/g, 'fill="none"')
						.replace(/fill="white"/g, 'fill="none"');
				} else {
					// Replace fill="none" with fill="white"
					processedContent = processedContent.replace(/fill="none"/g, 'fill="white"');
				}

				if (processingFeatures.addRootFill) {
					// Add fill="currentColor" to root SVG if no fill is present
					if (!processedContent.includes('fill=') && processedContent.includes('<svg')) {
						processedContent = processedContent.replace(/<svg([^>]*)>/, '<svg$1 fill="currentColor">');
					}
				}

				processedIcon.content = processedContent;
			}

			processedBatch.push(processedIcon);
		}

		return processedBatch;
	};

	const processIcons = async () => {
		const selectedIcons = consolidatedIcons.filter((icon) => icon.selected);

		if (selectedIcons.length === 0) {
			toast.error('No icons selected for processing');
			return;
		}

		setIsProcessing(true);
		setProcessProgress(0);

		try {
			// Create batches of icons
			const iconBatches = createBatches(consolidatedIcons, BATCH_SIZE);
			const totalBatches = iconBatches.length;

			// Initialize batch info
			setBatchInfo({
				currentBatch: 0,
				totalBatches,
				batchProgress: 0,
			});

			console.log(`Processing ${selectedIcons.length} icons in ${totalBatches} batches of up to ${BATCH_SIZE}`);

			let processedIcons: IconObject[] = [];
			let processedCount = 0;

			// Process each batch sequentially
			for (let batchIndex = 0; batchIndex < iconBatches.length; batchIndex++) {
				const batch = iconBatches[batchIndex];
				const selectedInBatch = batch.filter((icon) => icon.selected).length;
				const iconSenseCount = batch.filter((icon) => icon.selected && processingFeatures.iconSense).length;

				// Update batch info
				setBatchInfo({
					currentBatch: batchIndex + 1,
					totalBatches,
					batchProgress: 0,
				});

				console.log(
					`Processing batch ${
						batchIndex + 1
					}/${totalBatches} (${selectedInBatch} selected icons, ${iconSenseCount} with IconSense)`
				);

				// Process the current batch (with rate limiting built-in)
				const processedBatch = await processBatch(batch);
				processedIcons.push(...processedBatch);

				// Update processed count
				processedCount += selectedInBatch;

				// Update overall progress
				const overallProgress = ((batchIndex + 1) / totalBatches) * 100;
				setProcessProgress(overallProgress);

				// Update batch progress to 100% for completed batch
				setBatchInfo((prev) => ({
					...prev,
					batchProgress: 100,
				}));

				// Add delay between batches to prevent overwhelming the system
				if (batchIndex < iconBatches.length - 1) {
					console.log(
						`Batch ${batchIndex + 1} completed. Waiting ${
							batchProcessing.batchDelay / 1000
						} seconds before next batch...`
					);
					await new Promise((resolve) => setTimeout(resolve, batchProcessing.batchDelay));
				}
			}

			// Update the consolidated icons with processed versions
			setConsolidatedIcons(processedIcons);

			// Collect the enabled features for display
			const enabledFeatures: string[] = [];
			if (processingFeatures.colorization) enabledFeatures.push('Colorization');
			if (processingFeatures.standardization) enabledFeatures.push('Standardization');
			if (processingFeatures.optimization) enabledFeatures.push('Optimization');
			if (processingFeatures.iconSense) enabledFeatures.push('Icon Sense');

			// Calculate total size
			const totalSizeInBytes = selectedIcons.reduce((sum, icon) => {
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
			const formattedSize = (bytes: number): string => {
				if (bytes < 1024) return bytes + 'B';
				if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'KB';
				return (bytes / 1048576).toFixed(1) + 'MB';
			};

			// Set processed results
			setProcessedResults({
				processedCount: processedCount,
				featuresApplied: enabledFeatures,
				totalSize: formattedSize(optimizedSize),
			});

			// Reset batch info
			setBatchInfo({
				currentBatch: 0,
				totalBatches: 0,
				batchProgress: 0,
			});

			toast.success(`Processed ${processedCount} icons successfully in ${totalBatches} batches with rate limiting`);
		} catch (error) {
			console.error('Error processing icons:', error);
			toast.error('Failed to process icons. Please try again.');
			setProcessProgress(0);
			setBatchInfo({
				currentBatch: 0,
				totalBatches: 0,
				batchProgress: 0,
			});
		} finally {
			setIsProcessing(false);
		}
	};

	const generateJsonManifest = () => {
		const selectedIcons = consolidatedIcons.filter((icon) => icon.selected);
		const manifest = {
			icons: Object.fromEntries(
				selectedIcons.map((icon) => [
					icon.name.replace('.svg', ''),
					{
						path: `${icon.folder}/${icon.name}`,
						width: parseInt(icon.dimensions.split('x')[0]),
						height: parseInt(icon.dimensions.split('x')[1]),
						...(exportOptions.includeTags && { tags: icon.tags }),
					},
				])
			),
		};

		return JSON.stringify(manifest, null, 2);
	};

	const generateTypeScriptTypes = () => {
		const selectedIcons = consolidatedIcons.filter((icon) => icon.selected);
		const iconNames = selectedIcons.map((icon) => icon.name.replace('.svg', ''));

		let typescript = `export const IconNames = {
  ${iconNames.map((name) => `${name.replace(/-([a-z])/g, (_, g) => g.toUpperCase())}: "${name}"`).join(',\n  ')}
} as const;

export type IconName = keyof typeof IconNames;`;

		// If we're including tags, add types for them too
		if (exportOptions.includeTags) {
			const allTags = new Set<string>();
			selectedIcons.forEach((icon) => {
				if (icon.tags) {
					icon.tags.forEach((tag) => allTags.add(tag));
				}
			});

			typescript += `\n\nexport const IconTags = {
  ${Array.from(allTags)
		.map((tag) => `${tag.replace(/-([a-z])/g, (_, g) => g.toUpperCase()).replace(/\s+/g, '_')}: "${tag}"`)
		.join(',\n  ')}
} as const;

export type IconTag = keyof typeof IconTags;

export interface IconWithTags {
  name: IconName;
  tags: IconTag[];
}`;
		}

		return typescript;
	};

	const downloadZipPackage = () => {
		const selectedIcons = consolidatedIcons.filter((icon) => icon.selected);
		if (selectedIcons.length === 0) {
			toast.error('No icons selected for export');
			return;
		}

		const zip = new JSZip();
		const iconsFolder = zip.folder('icons');

		// Add icons
		selectedIcons.forEach((icon) => {
			const filePath = !exportOptions.flatOutput
				? `${icon.folder.startsWith('/') ? icon.folder.substring(1) : icon.folder}/${icon.name}`
				: icon.name;

			if (iconsFolder) {
				iconsFolder.file(filePath, icon.content);
			}
		});

		// Add JSON manifest if enabled
		if (exportOptions.includeJson) {
			zip.file('icons.json', generateJsonManifest());
		}

		// Add TypeScript types if enabled
		if (exportOptions.includeTypescript) {
			zip.file('icons.ts', generateTypeScriptTypes());
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

	// Navigation functions
	const goToNextStep = () => {
		const currentIndex = STEPS.findIndex((step) => step.id === activeStep);
		if (currentIndex < STEPS.length - 1) {
			setActiveStep(STEPS[currentIndex + 1].id);
		}
	};

	const goToPreviousStep = () => {
		const currentIndex = STEPS.findIndex((step) => step.id === activeStep);
		if (currentIndex > 0) {
			setActiveStep(STEPS[currentIndex - 1].id);
		}
	};

	const processingRef = useRef<HTMLDivElement>(null);

	const goToProcessing = () => setActiveStep('processing');
	const scrollToProcessing = () => {
		processingRef.current?.scrollIntoView({ behavior: 'smooth' });
	};
	const goToExport = () => setActiveStep('export');
	const goToCollection = () => setActiveStep('collection');

	return (
		<div>
			{/* Step progress indicator */}
			<div className='md:p-8 p-4 border-y bg-muted/30'>
				<div className='flex items-center justify-center w-full'>
					{STEPS.map((step, index) => (
						<button
							key={step.id}
							onClick={() => setActiveStep(step.id)}
							disabled={!isStepComplete(step.id)}
							className={`flex items-center justify-start w-full cursor-pointer ${
								!isStepComplete(step.id) ? 'opacity-50 cursor-not-allowed' : ''
							}`}>
							<div
								key={step.id}
								className='relative flex flex-col items-center w-full'>
								<div
									className={`flex items-center justify-center w-10 h-10 rounded-full border-2 z-10
									${
										activeStep === step.id
											? 'border-primary bg-primary text-primary-foreground'
											: isStepComplete(step.id)
											? 'border-primary bg-primary/10 text-primary'
											: 'border-muted-foreground/30 bg-background text-muted-foreground'
									}`}>
									{isStepComplete(step.id) ? <CheckIcon className='w-5 h-5' /> : <span>{index + 1}</span>}
								</div>
								<div className='mt-2 text-center'>
									<p className={`text-sm font-medium ${activeStep === step.id ? 'text-primary' : ''}`}>{step.label}</p>
									<p className='text-xs text-muted-foreground hidden sm:block'>{step.description}</p>
								</div>
							</div>
							{index < STEPS.length - 1 && (
								<div className='flex items-center justify-center mx-auto'>
									<ArrowRightIcon className='w-5 h-5' />
								</div>
							)}
						</button>
					))}
				</div>
			</div>

			<div className='md:p-8 p-4'>
				{/* Step 1: Collection */}
				{activeStep === 'collection' && (
					<IconCollection
						scanProgress={scanProgress}
						isScanning={isScanning}
						collectionStats={collectionStats}
						scanLog={scanLog}
						setScanProgress={setScanProgress}
						setIsScanning={setIsScanning}
						setCollectionStats={setCollectionStats}
						setScanLog={setScanLog}
						setConsolidatedIcons={setConsolidatedIcons}
						onProceedToDisplay={goToProcessing}
					/>
				)}

				{/* Step 2: Display and Processing */}
				{activeStep === 'processing' && (
					<div className='flex flex-col gap-4'>
						<IconDisplay
							consolidatedIcons={consolidatedIcons}
							collectionStats={collectionStats}
							toggleIconSelection={toggleIconSelection}
							selectAllIcons={selectAllIcons}
							clearIconSelection={clearIconSelection}
							onProceedToProcessing={scrollToProcessing}
							onBackToCollection={goToCollection}
							setConsolidatedIcons={setConsolidatedIcons}
							isProcessing={isProcessing}
						/>
						<IconProcessing
							processingRef={processingRef as React.RefObject<HTMLDivElement>}
							processingFeatures={processingFeatures}
							toggleProcessingFeature={toggleProcessingFeature}
							resetProcessingFeatures={resetProcessingFeatures}
							customPrefix={customPrefix}
							setCustomPrefix={setCustomPrefix}
							consolidatedIcons={consolidatedIcons}
							processedResults={processedResults}
							processProgress={processProgress}
							isProcessing={isProcessing}
							onBackToDisplay={goToCollection}
							onProceedToExport={goToExport}
							processIcons={processIcons}
							// Pass batch info for display
							batchInfo={batchInfo}
						/>
					</div>
				)}

				{/* Step 3: Export */}
				{activeStep === 'export' && (
					<IconExport
						consolidatedIcons={consolidatedIcons}
						exportOptions={exportOptions}
						toggleExportOption={toggleExportOption}
						downloadAllFiles={downloadAllFiles}
						onBackToProcessing={goToProcessing}
					/>
				)}

				{/* Navigation controls */}
				<div className='flex justify-between mt-8 pt-4 border-t'>
					<Button
						variant='outline'
						onClick={goToPreviousStep}
						disabled={activeStep === 'collection'}>
						<ArrowLeftIcon className='w-4 h-4 mr-2' />
						Back
					</Button>

					<div className='flex gap-2'>
						{activeStep === 'export' && (
							<Button
								variant='default'
								onClick={downloadAllFiles}
								disabled={!consolidatedIcons.some((icon) => icon.selected)}>
								<DownloadIcon className='w-4 h-4 mr-2' />
								Download Icons
							</Button>
						)}

						{activeStep !== 'export' && (
							<Button
								variant='default'
								onClick={goToNextStep}
								disabled={
									(activeStep === 'collection' && collectionStats.totalFiles === 0) ||
									(activeStep === 'display' && !consolidatedIcons.some((icon) => icon.selected)) ||
									(activeStep === 'processing' && processedResults.processedCount === 0)
								}>
								Next
								<ArrowRightIcon className='w-4 h-4 ml-2' />
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default IconManager;
