'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { RefreshCw, CheckSquare, ArrowRight, Zap, RotateCcw } from 'lucide-react';
import {
	IconObject,
	ProcessingFeatures,
	ProcessingFeature,
	ProcessedResults,
} from '../../../../types/icon-helper-types';

interface IconProcessingProps {
	processingRef: React.RefObject<HTMLDivElement>;
	processingFeatures: ProcessingFeatures;
	toggleProcessingFeature: (feature: ProcessingFeature) => void;
	resetProcessingFeatures: () => void;
	customPrefix: string;
	setCustomPrefix: (prefix: string) => void;
	consolidatedIcons: IconObject[];
	processedResults: ProcessedResults;
	processProgress: number;
	isProcessing: boolean;
	onBackToDisplay: () => void;
	onProceedToExport: () => void;
	processIcons: () => void;
	batchInfo: {
		currentBatch: number;
		totalBatches: number;
		batchProgress: number;
	};
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

const featureGroups = (customPrefix: string): FeatureGroup[] => {
	return [
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
			title: 'Icon Sense',
			description: 'AI-generated naming of icons filenames and icon tags.',
			mainFeature: 'iconSense',
			subFeatures: [
				{
					id: 'nameSense',
					label: 'Name Sense',
					description: 'AI-generated naming of icons filenames and icon tags.',
				},
				{
					id: 'tagSense',
					label: 'Tag Sense',
					description: 'AI-generated tags for icons.',
				},
			],
		},
		{
			title: 'Standardization',
			description: 'Normalize icon names and structures',
			mainFeature: 'standardization',
			subFeatures: [
				{
					id: 'addPrefix',
					label: `Add "${customPrefix}" prefix`,
					description: `Prefix all icon names with "${customPrefix}"`,
				},
				{
					id: 'kebabCase',
					label: 'Convert to kebab-case',
					description: 'Change filenames to use dashes instead of underscores or spaces',
				},
			],
		},
		{
			title: 'Optimization',
			description: 'Reduce file size and clean code',
			mainFeature: 'optimization',
			subFeatures: [],
		},
	];
};

const IconProcessing: React.FC<IconProcessingProps> = ({
	processingRef,
	processingFeatures,
	toggleProcessingFeature,
	resetProcessingFeatures,
	customPrefix,
	setCustomPrefix,
	consolidatedIcons,
	processedResults,
	processProgress,
	isProcessing,
	processIcons,
	batchInfo,
}) => {
	const selectedIconsCount = consolidatedIcons.filter((icon) => icon.selected).length;
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
			'removeWhiteBg',
			'addRootFill',
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
		<Card ref={processingRef}>
			<CardHeader>
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
										onClick={resetProcessingFeatures}
										disabled={isProcessing}>
										<RotateCcw className='h-4 w-4 mr-1' />
										<span className='text-xs'>Reset</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>Clear all processing settings</TooltipContent>
							</Tooltip>
						</TooltipProvider>

						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant='ghost'
										size='sm'
										className='h-7 px-2'
										onClick={applyQuickSetup}
										disabled={isProcessing}>
										<Zap className='h-4 w-4 mr-1' />
										<span className='text-xs'>Quick Setup</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>Apply recommended settings for most icons</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>
			</CardHeader>

			<CardContent className='space-y-4'>
				{featureGroups(customPrefix).map((group, index) => (
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
							<div className='pl-4 space-y-3'>
								<div className='grid gap-2 grid-cols-1 md:grid-cols-2'>
									{group.subFeatures.map((feature, featureIndex) => (
										<div
											key={featureIndex}
											className='flex items-center space-x-2 cursor-pointer'>
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

								{/* Show prefix input when addPrefix is enabled */}
								{group.mainFeature === 'standardization' && processingFeatures.addPrefix && (
									<div className='pt-2 pl-6 border-l-2 border-muted'>
										<div className='space-y-2'>
											<Label
												htmlFor='prefix-input'
												className='text-sm font-medium'>
												Custom Prefix
											</Label>
											<div className='flex items-center space-x-2'>
												<Input
													id='prefix-input'
													type='text'
													value={customPrefix}
													onChange={(e) => setCustomPrefix(e.target.value)}
													placeholder='icon-'
													className='w-32 h-8 text-sm'
													disabled={!processingFeatures[group.mainFeature] || isProcessing}
												/>
												<span className='text-xs text-muted-foreground'>filename.svg</span>
											</div>
											<p className='text-xs text-muted-foreground'>This prefix will be added to all icon filenames</p>
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				))}

				<div className='flex flex-col justify-between w-full gap-2'>
					{/* Always show progress bar - it's empty when not processing */}
					<div className='mt-2 w-full'>
						<Progress
							value={isProcessing ? processProgress : hasProcessedResults ? 100 : 0}
							className={`h-1 ${!isProcessing && !hasProcessedResults ? 'opacity-30' : ''}`}
						/>
					</div>
					<Button
						onClick={isProcessing ? undefined : processIcons}
						disabled={selectedIconsCount === 0 || isProcessing}
						className='gap-1'>
						{isProcessing ? (
							<>
								<RefreshCw className='h-4 w-4 animate-spin' /> Processing... {batchInfo.currentBatch}/
								{batchInfo.totalBatches}
							</>
						) : (
							<>
								Process {selectedIconsCount} Icons <ArrowRight className='h-4 w-4' />
							</>
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};

export default IconProcessing;
