'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, RefreshCw, CheckSquare, Square, ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import { IconObject, ProcessingFeatures, ProcessingFeature, ProcessedResults } from './types';

interface IconProcessingProps {
	processingFeatures: ProcessingFeatures;
	toggleProcessingFeature: (feature: ProcessingFeature) => void;
	consolidatedIcons: IconObject[];
	processedResults: ProcessedResults;
	processProgress: number;
	onBackToDisplay: () => void;
	onProceedToExport: () => void;
	processIcons: () => void;
}

type FeatureGroup = {
	title: string;
	description: string;
	mainFeature: ProcessingFeature;
	subFeatures: {
		id: ProcessingFeature;
		label: string;
		description: string;
	}[];
};

const featureGroups: FeatureGroup[] = [
	{
		title: 'Colorization',
		description: 'Enable dynamic theming with currentColor',
		mainFeature: 'colorization',
		subFeatures: [
			{
				id: 'replaceBlack',
				label: 'Replace black fills',
				description: 'Convert black fills to currentColor for theme support',
			},
			{
				id: 'preserveNone',
				label: 'Preserve fill="none"',
				description: 'Maintain transparency in elements with fill="none"',
			},
			{
				id: 'removeWhiteBg',
				label: 'Remove white backgrounds',
				description: 'Convert white backgrounds to transparent',
			},
			{ id: 'addRootFill', label: 'Add root fill if missing', description: 'Ensure SVG has a root fill attribute' },
		],
	},
	{
		title: 'Standardization',
		description: 'Normalize icon names and structures',
		mainFeature: 'standardization',
		subFeatures: [
			{
				id: 'kebabCase',
				label: 'Convert to kebab-case',
				description: 'Change filenames to use dashes instead of underscores or spaces',
			},
			{ id: 'addPrefix', label: 'Add "icon-" prefix', description: 'Prefix all icon names with "icon-"' },
		],
	},
	{
		title: 'Optimization',
		description: 'Reduce file size and clean code',
		mainFeature: 'optimization',
		subFeatures: [],
	},
];

const IconProcessing: React.FC<IconProcessingProps> = ({
	processingFeatures,
	toggleProcessingFeature,
	consolidatedIcons,
	processedResults,
	processProgress,
	onBackToDisplay,
	onProceedToExport,
	processIcons,
}) => {
	const [activeTab, setActiveTab] = useState<string>('features');
	const selectedIconsCount = consolidatedIcons.filter((icon) => icon.selected).length;
	const isProcessing = processProgress > 0 && processProgress < 100;
	const hasProcessedResults = processedResults.processedCount > 0;

	// Toggle all features in a group
	const toggleAllInGroup = (group: FeatureGroup, enabled: boolean) => {
		toggleProcessingFeature(group.mainFeature);
		group.subFeatures.forEach((subFeature) => {
			if (processingFeatures[group.mainFeature] !== enabled) {
				if (processingFeatures[subFeature.id] !== enabled) {
					toggleProcessingFeature(subFeature.id);
				}
			}
		});
	};

	// Quick setup - enable common options
	const applyQuickSetup = () => {
		// Enable the most common options
		const commonFeatures: ProcessingFeature[] = [
			'colorization',
			'replaceBlack',
			'preserveNone',
			'standardization',
			'kebabCase',
		];

		commonFeatures.forEach((feature) => {
			if (!processingFeatures[feature]) {
				toggleProcessingFeature(feature);
			}
		});
	};

	return (
		<Card>
			<CardHeader className='pb-2'>
				<div className='flex justify-between items-start'>
					<div>
						<CardTitle>Icon Processing</CardTitle>
						<CardDescription>Apply transformations to selected icons</CardDescription>
					</div>
					<div className='flex items-center space-x-1'>
						<Badge
							variant='outline'
							className='h-7'>
							{selectedIconsCount} icons selected
						</Badge>

						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant='ghost'
										size='sm'
										className='h-7 px-2'
										onClick={applyQuickSetup}>
										<Zap className='h-4 w-4 mr-1' />
										<span className='text-xs'>Quick Setup</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>Apply recommended settings for most icons</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>

				{/* Always show progress bar - it's empty when not processing */}
				<div className='mt-2'>
					<Progress
						value={isProcessing ? processProgress : hasProcessedResults ? 100 : 0}
						className={`h-1 ${!isProcessing && !hasProcessedResults ? 'opacity-30' : ''}`}
					/>
				</div>
			</CardHeader>

			<CardContent className='space-y-4 pt-2'>
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className='w-full'>
					<TabsList className='w-full grid grid-cols-2'>
						<TabsTrigger value='features'>Processing Features</TabsTrigger>
						<TabsTrigger
							value='results'
							disabled={!hasProcessedResults}>
							Results {hasProcessedResults && `(${processedResults.processedCount})`}
						</TabsTrigger>
					</TabsList>

					<TabsContent
						value='features'
						className='pt-4'>
						<div className='space-y-4'>
							{featureGroups.map((group, index) => (
								<div
									key={index}
									className='space-y-3 border rounded-md p-3'>
									<div className='flex justify-between items-center'>
										<div className='flex items-center gap-2'>
											<div>
												<Label
													htmlFor={group.mainFeature}
													className='text-base font-medium'>
													{group.title}
												</Label>
												<p className='text-xs text-muted-foreground'>{group.description}</p>
											</div>

											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															size='sm'
															variant='ghost'
															className='h-6 w-6 p-0'>
															<InfoIcon className='h-4 w-4 text-muted-foreground' />
														</Button>
													</TooltipTrigger>
													<TooltipContent>{group.description}</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</div>

										<div className='flex items-center gap-2'>
											{group.subFeatures.length > 0 && (
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<Button
																size='sm'
																variant='ghost'
																className='h-7 p-0 px-1'
																onClick={() => toggleAllInGroup(group, true)}
																disabled={isProcessing}>
																<CheckSquare className='h-4 w-4' />
															</Button>
														</TooltipTrigger>
														<TooltipContent>Select all in group</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											)}

											<Switch
												id={group.mainFeature}
												checked={processingFeatures[group.mainFeature]}
												onCheckedChange={() => toggleProcessingFeature(group.mainFeature)}
												disabled={isProcessing}
											/>
										</div>
									</div>

									{group.subFeatures.length > 0 && (
										<div className='pl-4 grid gap-2 grid-cols-1 md:grid-cols-2'>
											{group.subFeatures.map((feature, featureIndex) => (
												<div
													key={featureIndex}
													className='flex items-center space-x-2'>
													<Switch
														id={feature.id}
														checked={processingFeatures[feature.id]}
														onCheckedChange={() => toggleProcessingFeature(feature.id)}
														disabled={!processingFeatures[group.mainFeature] || isProcessing}
													/>
													<div>
														<Label
															htmlFor={feature.id}
															className={`text-sm ${
																!processingFeatures[group.mainFeature] ? 'text-muted-foreground' : ''
															}`}>
															{feature.label}
														</Label>
														<p className='text-xs text-muted-foreground hidden md:block'>{feature.description}</p>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							))}

							<div className='flex justify-between pt-4'>
								<Button
									variant='outline'
									onClick={onBackToDisplay}
									disabled={isProcessing}
									className='gap-1'>
									<ArrowLeft className='h-4 w-4' /> Back to Gallery
								</Button>

								<Button
									onClick={isProcessing ? undefined : hasProcessedResults ? onProceedToExport : processIcons}
									disabled={selectedIconsCount === 0 || isProcessing}
									className='gap-1'>
									{isProcessing ? (
										<>
											<RefreshCw className='h-4 w-4 animate-spin' /> Processing...
										</>
									) : hasProcessedResults ? (
										<>
											Continue to Export <ArrowRight className='h-4 w-4' />
										</>
									) : (
										<>
											Process {selectedIconsCount} Icons <ArrowRight className='h-4 w-4' />
										</>
									)}
								</Button>
							</div>
						</div>
					</TabsContent>

					<TabsContent
						value='results'
						className='pt-4'>
						{hasProcessedResults && (
							<div className='space-y-4'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div className='border rounded-md p-4'>
										<h3 className='font-medium mb-3'>Processing Summary</h3>
										<div className='space-y-3'>
											<div className='flex justify-between'>
												<span className='text-sm'>Processed icons:</span>
												<Badge>{processedResults.processedCount}</Badge>
											</div>
											<div className='flex justify-between'>
												<span className='text-sm'>Total size:</span>
												<Badge variant='secondary'>{processedResults.totalSize}</Badge>
											</div>
										</div>
									</div>

									<div className='border rounded-md p-4'>
										<h3 className='font-medium mb-3'>Applied Features</h3>
										<div className='flex flex-wrap gap-1'>
											{processedResults.featuresApplied.length > 0 ? (
												processedResults.featuresApplied.map((feature, i) => (
													<Badge
														key={i}
														variant='outline'
														className='text-xs'>
														{feature}
													</Badge>
												))
											) : (
												<span className='text-sm text-muted-foreground'>No features applied</span>
											)}
										</div>
									</div>
								</div>

								<div className='flex justify-between pt-2'>
									<Button
										variant='outline'
										onClick={() => setActiveTab('features')}>
										Back to Features
									</Button>

									<Button
										onClick={onProceedToExport}
										className='gap-1'>
										Continue to Export <ArrowRight className='h-4 w-4' />
									</Button>
								</div>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
};

export default IconProcessing;
