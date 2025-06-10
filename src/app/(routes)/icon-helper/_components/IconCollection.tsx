'use client';
import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FolderUp, FileUp, AlertCircle, CheckCircle, AlertTriangle, Upload, Info } from 'lucide-react';
import { toast } from 'sonner';
import { CollectionStats, IconObject, ScanLogEntry } from '../../../../types/icon-helper-types';
import { formatFileSize, estimateSvgDimensions } from '@/lib/utils';

interface IconCollectionProps {
	scanProgress: number;
	isScanning: boolean;
	collectionStats: CollectionStats;
	scanLog: ScanLogEntry[];
	setScanProgress: (progress: number) => void;
	setIsScanning: (scanning: boolean) => void;
	setCollectionStats: (stats: CollectionStats) => void;
	setScanLog: React.Dispatch<React.SetStateAction<ScanLogEntry[]>>;
	setConsolidatedIcons: (icons: IconObject[]) => void;
	onProceedToDisplay: () => void;
}

const IconCollection: React.FC<IconCollectionProps> = ({
	scanProgress,
	isScanning,
	collectionStats,
	scanLog,
	setScanProgress,
	setIsScanning,
	setCollectionStats,
	setScanLog,
	setConsolidatedIcons,
	onProceedToDisplay,
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const folderInputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const handleFileSelect = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleFolderSelect = () => {
		if (folderInputRef.current) {
			folderInputRef.current.click();
		}
	};

	const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			collectIcons(e.target.files);
		}
	};

	// Drag and drop handlers
	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback(() => {
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		// Handle dropped files
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			collectIcons(e.dataTransfer.files);
		}
	}, []);

	const collectIcons = (fileList: FileList) => {
		setIsScanning(true);
		setScanProgress(0);
		setScanLog([]);

		const files = Array.from(fileList).filter((file) => file.name.toLowerCase().endsWith('.svg'));

		if (files.length === 0) {
			setIsScanning(false);
			return;
		}

		const folderPaths = new Set<string>();
		const iconObjects: IconObject[] = [];
		const duplicateCheck = new Map<string, string>();
		const allTags = new Set<string>();
		let errors = 0;
		let duplicates = 0;

		const processNextFile = (index: number) => {
			if (index >= files.length) {
				// Finished processing
				setIsScanning(false);
				setScanProgress(100);
				setCollectionStats({
					totalFiles: iconObjects.length,
					totalFolders: folderPaths.size,
					duplicates,
					errors,
					uniqueTags: allTags.size,
				});
				setConsolidatedIcons(iconObjects);
				return;
			}

			const file = files[index];
			const progress = Math.floor((index / files.length) * 100);
			setScanProgress(progress);

			// Extract folder path from webkitRelativePath or use root for individual files
			let folderPath = '/';
			if (file.webkitRelativePath) {
				const pathParts = file.webkitRelativePath.split('/');
				pathParts.pop(); // Remove filename
				folderPath = '/' + pathParts.slice(1).join('/'); // Skip the root folder
			}
			folderPaths.add(folderPath);

			// Check for duplicates
			if (duplicateCheck.has(file.name)) {
				duplicates++;
				setScanLog((prevLogs) => [
					...prevLogs,
					{
						type: 'warning',
						message: `Duplicate: ${file.name}`,
						details: `Already exists at ${duplicateCheck.get(file.name)}, new location: ${folderPath}`,
					},
				]);
				processNextFile(index + 1);
				return;
			}

			duplicateCheck.set(file.name, folderPath);

			// Read file content
			const reader = new FileReader();
			reader.onload = (event) => {
				if (event.target && typeof event.target.result === 'string') {
					let content = event.target.result;

					try {
						// Validate SVG content
						if (!content.includes('<svg') || !content.includes('</svg>')) {
							throw new Error('Invalid SVG format');
						}

						const dimensions = estimateSvgDimensions(content);
						const size = formatFileSize(file.size);

						// Generate tags from the folder path only
						// Remove the first slash, then split by slashes to get folder names as tags
						const tags = folderPath
							.substring(1)
							.split('/')
							.filter((tag) => tag.trim() !== '');

						// Update the set of all tags
						tags.forEach((tag) => allTags.add(tag));

						iconObjects.push({
							name: file.name,
							folder: 'icons',
							size,
							dimensions,
							path: `/icons/${file.name}`,
							content,
							selected: false,
							tags,
						});

						setScanLog((prevLogs) => [
							...prevLogs,
							{
								type: 'success',
								message: `Collected: ${file.name}`,
								details: tags.length > 0 ? `with tags: ${tags.join(', ')}` : 'individual file',
							},
						]);
					} catch (error) {
						errors++;
						setScanLog((prevLogs) => [
							...prevLogs,
							{
								type: 'error',
								message: `Error: ${file.name}`,
								details: error instanceof Error ? error.message : 'Unknown error',
							},
						]);
					}

					// Process next file
					processNextFile(index + 1);
				}
			};

			reader.onerror = () => {
				errors++;
				setScanLog((prevLogs) => [
					...prevLogs,
					{
						type: 'error',
						message: `Failed to read: ${file.name}`,
						details: `Error reading file`,
					},
				]);
				processNextFile(index + 1);
			};

			reader.readAsText(file);
		};

		// Start processing files
		processNextFile(0);
	};

	// Demo function to create mock icons with various naming patterns
	const createDemoIcons = () => {
		setIsScanning(true);
		setScanProgress(0);
		setScanLog([]);

		// Mock icons with various naming patterns to demonstrate kebab-case transformation
		const mockIconData = [
			{ name: 'arrow_right.svg', folder: '/navigation' },
			{ name: 'check_circle.svg', folder: '/status' },
			{ name: 'menu Icon.svg', folder: '/ui' },
			{ name: 'userProfile.svg', folder: '/user' },
			{ name: 'shopping_cart.svg', folder: '/ecommerce' },
			{ name: 'search Icon.svg', folder: '/ui' },
			{ name: 'fileUpload.svg', folder: '/actions' },
			{ name: 'heart_filled.svg', folder: '/status' },
			{ name: 'bell Notification.svg', folder: '/notifications' },
			{ name: 'loginUser.svg', folder: '/user' },
			{ name: 'home_page.svg', folder: '/navigation' },
			{ name: 'settings_gear.svg', folder: '/ui' },
		];

		const baseSvgContent =
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/></svg>';

		const iconObjects: IconObject[] = [];
		const folderPaths = new Set<string>();
		const allTags = new Set<string>();

		// Simulate processing with progress
		let processedCount = 0;
		const interval = setInterval(() => {
			if (processedCount >= mockIconData.length) {
				clearInterval(interval);
				setIsScanning(false);
				setScanProgress(100);

				setCollectionStats({
					totalFiles: iconObjects.length,
					totalFolders: folderPaths.size,
					duplicates: 0,
					errors: 0,
					uniqueTags: allTags.size,
				});

				setConsolidatedIcons(iconObjects);
				toast.success(`Demo: Created ${iconObjects.length} mock icons with various naming patterns`);
				return;
			}

			const mockIcon = mockIconData[processedCount];
			const folderPath = mockIcon.folder;
			folderPaths.add(folderPath);

			// Generate tags from folder
			const tags = folderPath
				.substring(1)
				.split('/')
				.filter((tag) => tag.trim() !== '');
			tags.forEach((tag) => allTags.add(tag));

			iconObjects.push({
				name: mockIcon.name,
				folder: folderPath,
				size: `${Math.floor(Math.random() * 2000) + 500}B`,
				dimensions: '24x24',
				path: `${folderPath}/${mockIcon.name}`,
				content: baseSvgContent,
				selected: false,
				tags,
			});

			setScanLog((prevLogs) => [
				...prevLogs,
				{
					type: 'success',
					message: `Demo: ${mockIcon.name}`,
					details: `Added to ${folderPath}`,
				},
			]);

			processedCount++;
			setScanProgress(Math.floor((processedCount / mockIconData.length) * 100));
		}, 150);
	};

	return (
		<div className='space-y-6 mx-auto'>
			<Alert
				variant='default'
				className='bg-muted/50'>
				<Info className='h-4 w-4' />
				<AlertTitle>Getting Started</AlertTitle>
				<AlertDescription>
					Select individual SVG files or a folder with SVG icons to scan. The system will automatically collect all SVG
					files and extract their metadata.
				</AlertDescription>
			</Alert>

			<div
				className={`border-2 border-dashed rounded-lg p-8 transition-colors duration-200
          ${isDragging ? 'border-primary bg-primary/5' : 'hover:border-primary hover:bg-muted/30'}
          cursor-pointer flex flex-col items-center justify-center text-center`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}>
				<div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
					<Upload className='h-8 w-8 text-primary' />
				</div>
				<h3 className='text-lg font-medium mb-2'>
					{isScanning ? 'Scanning icons...' : 'Choose files or folder, or drag & drop'}
				</h3>

				{!isScanning && (
					<div className='flex gap-2 mb-2'>
						<Button
							variant='outline'
							disabled={isScanning}
							onClick={(e) => {
								e.stopPropagation();
								handleFileSelect();
							}}>
							<FileUp className='mr-2 h-4 w-4' />
							Select Files
						</Button>
						<Button
							variant='outline'
							disabled={isScanning}
							onClick={(e) => {
								e.stopPropagation();
								handleFolderSelect();
							}}>
							<FolderUp className='mr-2 h-4 w-4' />
							Select Folder
						</Button>
					</div>
				)}

				{!isScanning && (
					<Button
						variant='ghost'
						disabled={isScanning}
						className='mb-2'
						onClick={(e) => {
							e.stopPropagation();
							createDemoIcons();
						}}>
						Demo with Sample Icons
					</Button>
				)}
				<p className='text-xs text-muted-foreground'>Supports .svg files only</p>
				<input
					ref={fileInputRef}
					id='file-input'
					type='file'
					className='hidden'
					multiple
					accept='.svg'
					onChange={handleFilesSelected}
				/>
				<input
					ref={folderInputRef}
					id='folder-input'
					type='file'
					className='hidden'
					// @ts-ignore - webkitdirectory exists in Chrome but not in type definitions
					webkitdirectory=''
					directory=''
					onChange={handleFilesSelected}
				/>
			</div>

			{/* Scan Log */}
			{scanLog.length > 0 && (
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-base'>Scan Log</CardTitle>
						<CardDescription>Recent activity from the scan process</CardDescription>
					</CardHeader>
					<CardContent>
						{/* Progress and Stats Section */}
						<div className='flex w-full mb-4'>
							{/* Collection Statistics */}
							{!isScanning && collectionStats.totalFiles > 0 ? (
								<div className='flex justify-around gap-4 text-sm w-full'>
									<div className='flex items-center gap-1.5'>
										<FileUp className='h-4 w-4 text-muted-foreground' />
										<span>Total Files:</span>
										<div className='font-medium'>{collectionStats.totalFiles}</div>
									</div>

									<div className='flex items-center gap-1.5'>
										<FolderUp className='h-4 w-4 text-muted-foreground' />
										<span>Total Folders:</span>
										<div className='font-medium'>{collectionStats.totalFolders}</div>
									</div>

									<div className='flex items-center gap-1.5'>
										<AlertTriangle className='h-4 w-4 text-amber-500' />
										<span>Duplicates:</span>
										<div className='font-medium'>{collectionStats.duplicates}</div>
									</div>

									<div className='flex items-center gap-1.5'>
										<AlertCircle className='h-4 w-4 text-red-500' />
										<span>Errors:</span>
										<div className='font-medium'>{collectionStats.errors}</div>
									</div>

									<div className='flex items-center gap-1.5'>
										<Info className='h-4 w-4 text-muted-foreground' />
										<span>Unique Tags:</span>
										<div className='font-medium'>{collectionStats.uniqueTags}</div>
									</div>
								</div>
							) : (
								<Progress
									value={scanProgress}
									className='h-2 mb-4'
								/>
							)}
						</div>
						<div className='border rounded-md px-2 py-1 max-h-[200px] overflow-y-auto'>
							<div className='flex flex-col-reverse gap-1'>
								{scanLog.map((log, index) => (
									<div
										key={index}
										className={`text-xs border-b px-2 py-1.5 flex items-start gap-2 
                      ${index % 2 === 0 ? 'bg-muted/10' : ''}`}>
										{log.type === 'success' && (
											<CheckCircle className='h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5' />
										)}
										{log.type === 'warning' && (
											<AlertTriangle className='h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5' />
										)}
										{log.type === 'error' && <AlertCircle className='h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5' />}
										<div>
											<div className='font-medium'>{log.message}</div>
											{log.details && <div className='text-muted-foreground'>{log.details}</div>}
										</div>
									</div>
								))}
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default IconCollection;
