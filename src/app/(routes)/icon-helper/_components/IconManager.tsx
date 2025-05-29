'use client';
import React, { useState, useRef, useEffect } from 'react';
import IconCollection from './IconCollection';
import IconDisplay from './IconDisplay';
import IconProcessing from './IconProcessing';
import IconExport from './IconExport';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckIcon, ArrowRightIcon, ArrowLeftIcon, InfoIcon, DownloadIcon } from 'lucide-react';

import {
	CollectionStats,
	IconObject,
	ScanLogEntry,
	ProcessingFeature,
	ProcessingFeatures,
	ProcessedResults,
	ExportOptions,
} from './types';

// Steps configuration for better visualization
const STEPS = [
	{ id: 'collection', label: 'Collection', description: 'Import and manage SVG files' },
	{ id: 'display', label: 'Display', description: 'View and select icons' },
	{ id: 'processing', label: 'Processing', description: 'Apply transformations' },
	{ id: 'export', label: 'Export', description: 'Download processed icons' },
];

const IconManager = () => {
	const [activeStep, setActiveStep] = useState('collection');
	const [scanProgress, setScanProgress] = useState(0);
	const [processProgress, setProcessProgress] = useState(0);
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

	// Get current step index for progress indicator
	const currentStepIndex = STEPS.findIndex((step) => step.id === activeStep);

	// Check if current step is complete based on conditions
	const isStepComplete = (stepId: string) => {
		switch (stepId) {
			case 'collection':
				return collectionStats.totalFiles > 0;
			case 'display':
				return consolidatedIcons.some((icon) => icon.selected);
			case 'processing':
				return processedResults.processedCount > 0;
			case 'export':
				return false; // Export is the final step
			default:
				return false;
		}
	};

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

	const processIcons = () => {
		const selectedIcons = consolidatedIcons.filter((icon) => icon.selected);

		if (selectedIcons.length === 0) {
			toast.error('No icons selected for processing');
			return;
		}

		setProcessProgress(0);

		// Collect the enabled features
		const enabledFeatures: string[] = [];
		Object.entries(processingFeatures).forEach(([feature, enabled]) => {
			if (enabled) {
				enabledFeatures.push(feature);
			}
		});

		// Simulate processing with a progress bar
		let progress = 0;
		const interval = setInterval(() => {
			progress += 5;
			setProcessProgress(progress);

			if (progress >= 100) {
				clearInterval(interval);

				// Set processed results
				setProcessedResults({
					processedCount: selectedIcons.length,
					featuresApplied: enabledFeatures,
					totalSize: `${Math.round(selectedIcons.reduce((sum, icon) => sum + parseInt(icon.size), 0) / 1024)}KB`,
				});

				toast.success(`Processed ${selectedIcons.length} icons successfully`);
			}
		}, 100);
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

	const goToDisplay = () => setActiveStep('display');
	const goToProcessing = () => setActiveStep('processing');
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
						onProceedToDisplay={goToDisplay}
					/>
				)}

				{/* Step 2: Display */}
				{activeStep === 'display' && (
					<IconDisplay
						consolidatedIcons={consolidatedIcons}
						collectionStats={collectionStats}
						toggleIconSelection={toggleIconSelection}
						selectAllIcons={selectAllIcons}
						clearIconSelection={clearIconSelection}
						onProceedToProcessing={goToProcessing}
						onBackToCollection={goToCollection}
						setConsolidatedIcons={setConsolidatedIcons}
					/>
				)}

				{/* Step 3: Processing */}
				{activeStep === 'processing' && (
					<IconProcessing
						processingFeatures={processingFeatures}
						toggleProcessingFeature={toggleProcessingFeature}
						consolidatedIcons={consolidatedIcons}
						processedResults={processedResults}
						processProgress={processProgress}
						onBackToDisplay={goToDisplay}
						onProceedToExport={goToExport}
						processIcons={processIcons}
					/>
				)}

				{/* Step 4: Export */}
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
