'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DownloadIcon, FolderIcon, FileIcon, ArchiveIcon, TagIcon } from 'lucide-react';
import { IconObject, ExportOptions } from './types';

interface IconExportProps {
	consolidatedIcons: IconObject[];
	exportOptions: ExportOptions;
	toggleExportOption: (option: keyof ExportOptions) => void;
	downloadAllFiles: () => void;
	onBackToProcessing: () => void;
}

const IconExport: React.FC<IconExportProps> = ({
	consolidatedIcons,
	exportOptions,
	toggleExportOption,
	downloadAllFiles,
	onBackToProcessing,
}) => {
	const selectedIcons = consolidatedIcons.filter((icon) => icon.selected);

	return (
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
						onClick={downloadAllFiles}
						disabled={selectedIcons.length === 0}>
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
							<div className='flex items-center space-x-3'>
								<Switch
									id='include-tags'
									checked={exportOptions.includeTags}
									onCheckedChange={() => toggleExportOption('includeTags')}
								/>
								<div>
									<Label
										htmlFor='include-tags'
										className='text-sm'>
										Include Tags
									</Label>
									<p className='text-xs text-muted-foreground'>Export tags in JSON and TypeScript</p>
								</div>
							</div>
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
    ${selectedIcons
			.slice(0, 3)
			.map(
				(icon) =>
					`"${icon.name.replace('.svg', '')}": {
      "path": "${icon.folder}/${icon.name}",
      "width": ${icon.dimensions.split('x')[0]},
      "height": ${icon.dimensions.split('x')[1]}${
						exportOptions.includeTags && icon.tags?.length
							? `,
      "tags": ${JSON.stringify(icon.tags)}`
							: ''
					}
    }`
			)
			.join(',\n    ')}${selectedIcons.length > 3 ? ',\n    // ... more icons' : ''}
  }
}`}
									</pre>
								</div>
							)}

							<div className='flex items-center space-x-3 mb-3'>
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
								<div className='ml-8 mb-3 border-l-2 pl-3 text-xs font-mono text-muted-foreground'>
									<pre className='whitespace-pre-wrap'>
										{`export const IconNames = {
  ${selectedIcons
		.slice(0, 3)
		.map(
			(icon) =>
				`${icon.name.replace('.svg', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase())}: "${icon.name.replace(
					'.svg',
					''
				)}"`
		)
		.join(',\n  ')}${selectedIcons.length > 3 ? ',\n  // ... more icons' : ''}
} as const;

export type IconName = keyof typeof IconNames;${
											exportOptions.includeTags
												? `

// Tags are also exported as constants and types
export const IconTags = {
  ${Array.from(new Set(selectedIcons.flatMap((icon) => (icon.tags || []).slice(0, 5))))
		.map((tag) => `${tag.replace(/-([a-z])/g, (_, g) => g.toUpperCase())}: "${tag}"`)
		.join(',\n  ')}
} as const;

export type IconTag = keyof typeof IconTags;`
												: ''
										}`}
									</pre>
								</div>
							)}
						</div>
					</div>

					<div className='space-y-4'>
						<h3 className='font-medium'>Output Preview</h3>
						<div className='flex items-center space-x-3'>
							<Switch
								id='flat-output'
								checked={exportOptions.flatOutput}
								onCheckedChange={() => toggleExportOption('flatOutput')}
							/>
							<div>
								<Label
									htmlFor='flat-output'
									className='text-sm'>
									{exportOptions.flatOutput ? 'Flat Output' : 'Preserve Folder Structure'}
								</Label>
								{exportOptions.flatOutput ? (
									<p className='text-xs text-muted-foreground'>All icons in a single directory</p>
								) : (
									<p className='text-xs text-muted-foreground'>Icons are organized by folder</p>
								)}
							</div>
						</div>
						<div className='border rounded-md p-3 h-[240px] overflow-auto bg-muted/10'>
							<div className='text-xs font-mono'>
								{!exportOptions.flatOutput ? (
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
												selectedIcons.map((icon) => {
													const parts = icon.folder.split('/');
													return parts[1] || 'other';
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
												{selectedIcons
													.filter((icon) => icon.folder.includes(`/${folder}`))
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
															{exportOptions.includeTags && icon.tags && icon.tags.length > 0 && (
																<span className='ml-1 flex items-center text-xs'>
																	<TagIcon
																		size={10}
																		className='mr-1'
																	/>
																	{icon.tags.slice(0, 2).join(', ')}
																	{icon.tags.length > 2 && '...'}
																</span>
															)}
														</div>
													))}
												{selectedIcons.filter((icon) => icon.folder.includes(`/${folder}`)).length > 3 && (
													<div className='ml-4 text-muted-foreground'>... more files</div>
												)}
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
										{selectedIcons.slice(0, 8).map((icon, i) => (
											<div
												key={i}
												className='ml-4 flex items-center text-muted-foreground'>
												<FileIcon
													size={14}
													className='mr-1'
												/>{' '}
												{icon.name}
												{exportOptions.includeTags && icon.tags && icon.tags.length > 0 && (
													<span className='ml-1 flex items-center text-xs'>
														<TagIcon
															size={10}
															className='mr-1'
														/>
														{icon.tags.slice(0, 2).join(', ')}
														{icon.tags.length > 2 && '...'}
													</span>
												)}
											</div>
										))}
										{selectedIcons.length > 8 && <div className='ml-4 text-muted-foreground'>... more files</div>}
									</>
								)}

								{exportOptions.includeJson && (
									<div className='mt-2 flex items-center text-primary'>
										<FileIcon
											size={16}
											className='mr-1'
										/>{' '}
										icons.json
									</div>
								)}

								{exportOptions.includeTypescript && (
									<div className='flex items-center text-primary'>
										<FileIcon
											size={16}
											className='mr-1'
										/>{' '}
										icons.ts
									</div>
								)}
							</div>
						</div>

						<div className='flex gap-2 mt-2'>
							<Button
								variant='outline'
								size='sm'
								onClick={downloadAllFiles}
								disabled={selectedIcons.length === 0}
								className='w-full justify-center'>
								<ArchiveIcon
									size={14}
									className='mr-2'
								/>
								Download ZIP Package
							</Button>
						</div>
					</div>
				</div>

				<div className='flex justify-start pt-2'>
					<Button
						variant='outline'
						onClick={onBackToProcessing}>
						Back to Processing
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};

export default IconExport;
