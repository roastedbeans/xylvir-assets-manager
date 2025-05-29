'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
	CheckCircle,
	Search,
	Tag,
	Plus,
	X,
	FolderUp,
	FolderIcon,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from 'lucide-react';
import { IconObject, CollectionStats } from './types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';

interface IconDisplayProps {
	consolidatedIcons: IconObject[];
	collectionStats: CollectionStats;
	toggleIconSelection: (index: number) => void;
	selectAllIcons: () => void;
	clearIconSelection: () => void;
	onProceedToProcessing: () => void;
	onBackToCollection: () => void;
	setConsolidatedIcons: React.Dispatch<React.SetStateAction<IconObject[]>>;
}

// Item with original index for proper selection
interface IndexedIconObject extends IconObject {
	originalIndex: number;
}

// Create a separate tag input component to prevent re-renders of the entire card
const TagInput = ({
	iconIndex,
	onAddTag,
	isDisabled,
}: {
	iconIndex: number;
	onAddTag: (index: number, tag: string) => void;
	isDisabled: boolean;
}) => {
	const [inputValue, setInputValue] = useState('');

	const handleAddTag = useCallback(() => {
		if (!inputValue.trim()) return;
		onAddTag(iconIndex, inputValue);
		setInputValue(''); // Clear input after adding
	}, [iconIndex, inputValue, onAddTag]);

	return (
		<div
			className='flex'
			onClick={(e) => e.stopPropagation()}>
			<Input
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						handleAddTag();
					}
				}}
				placeholder='Add tag...'
				className='h-7 text-xs py-0'
				maxLength={10}
				disabled={isDisabled}
			/>
			<Button
				size='icon'
				variant='ghost'
				className='h-7 w-7 p-0 ml-1'
				onClick={handleAddTag}
				disabled={isDisabled || !inputValue.trim()}>
				<Plus className='h-3 w-3' />
			</Button>
		</div>
	);
};

// TagList component to handle the display and removal of tags
const TagList = React.memo(
	({
		tags,
		iconIndex,
		onRemoveTag,
	}: {
		tags: string[] | undefined;
		iconIndex: number;
		onRemoveTag: (index: number, tag: string) => void;
	}) => {
		if (!tags || tags.length === 0) {
			return <div className='text-xs text-muted-foreground h-6 flex items-center'>No tags added yet</div>;
		}

		return (
			<>
				{tags.map((tag, tagIndex) => (
					<Badge
						key={`${tag}-${tagIndex}`}
						variant='secondary'
						className='text-xs flex items-center gap-0.5 whitespace-nowrap'>
						<span>{tag}</span>
						<button
							className='ml-1 hover:text-destructive'
							onClick={(e) => {
								e.stopPropagation();
								onRemoveTag(iconIndex, tag);
							}}>
							<X className='h-3 w-3' />
						</button>
					</Badge>
				))}
			</>
		);
	}
);

TagList.displayName = 'TagList';

// IconCard component
const IconCard = React.memo(
	({
		icon,
		toggleIconSelection,
		onAddTag,
		onRemoveTag,
	}: {
		icon: IndexedIconObject;
		toggleIconSelection: (index: number) => void;
		onAddTag: (index: number, tag: string) => void;
		onRemoveTag: (index: number, tag: string) => void;
	}) => {
		const maxTagsReached = icon.tags && icon.tags.length >= 6;

		return (
			<div
				className={`border rounded-md flex flex-col p-2 justify-between gap-2 hover:border-primary cursor-pointer transition-all ${
					icon.selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''
				}`}
				onClick={() => toggleIconSelection(icon.originalIndex)}>
				<div className='relative w-full h-24 bg-secondary/30 rounded flex items-center justify-center'>
					{icon.selected && (
						<div className='absolute top-2 right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center'>
							<CheckCircle className='w-4 h-4' />
						</div>
					)}

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

				<Badge
					variant='outline'
					className='text-xs flex items-center gap-0.5 max-w-full bg-muted/50'>
					<FolderIcon className='h-3 w-3 mr-1' />
					<span className='truncate'>{icon.folder}</span>
				</Badge>

				<div className='flex flex-col gap-2 justify-between min-h-[80px]'>
					<div className='flex flex-wrap gap-1 min-h-[40px] py-1 px-1'>
						<TagList
							tags={icon.tags}
							iconIndex={icon.originalIndex}
							onRemoveTag={onRemoveTag}
						/>
					</div>

					<TagInput
						iconIndex={icon.originalIndex}
						onAddTag={onAddTag}
						isDisabled={maxTagsReached}
					/>
					{maxTagsReached && <div className='text-xs text-muted-foreground text-center'>Max 6 tags reached</div>}
				</div>
			</div>
		);
	}
);

IconCard.displayName = 'IconCard';

const IconDisplay: React.FC<IconDisplayProps> = ({
	consolidatedIcons,
	collectionStats,
	toggleIconSelection,
	selectAllIcons,
	clearIconSelection,
	onProceedToProcessing,
	onBackToCollection,
	setConsolidatedIcons,
}) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [activeTag, setActiveTag] = useState('all');
	const [activeFolder, setActiveFolder] = useState('all');
	const [activeViewMode, setActiveViewMode] = useState<'tags' | 'folders'>('tags');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 8;

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, activeTag, activeFolder, activeViewMode]);

	// Add tag to icon - force new reference creation to trigger re-render
	const addTagToIcon = useCallback((iconIndex: number, tagValue: string) => {
		if (!tagValue.trim()) return;

		const trimmedTag = tagValue.trim().slice(0, 10);

		setConsolidatedIcons((prevIcons) => {
			// Create a copy of the previous icons array
			const updatedIcons = [...prevIcons];
			const icon = { ...updatedIcons[iconIndex] };

			// Initialize tags array if it doesn't exist
			if (!icon.tags) {
				icon.tags = [];
			} else {
				// Make a copy of the tags array
				icon.tags = [...icon.tags];
			}

			// Check if tag already exists or max tags reached
			if (icon.tags.includes(trimmedTag) || icon.tags.length >= 6) {
				return prevIcons; // Return original if no change
			}

			// Add tag and sort
			icon.tags.push(trimmedTag);
			icon.tags.sort();

			// Update the icon in the array copy
			updatedIcons[iconIndex] = icon;

			return updatedIcons;
		});
	}, []);

	// Remove tag from icon
	const removeTagFromIcon = useCallback((iconIndex: number, tagToRemove: string) => {
		setConsolidatedIcons((prevIcons) => {
			// Create a copy of the previous icons array
			const updatedIcons = [...prevIcons];
			const icon = { ...updatedIcons[iconIndex] };

			if (!icon.tags || !icon.tags.includes(tagToRemove)) {
				return prevIcons; // Return original if no change needed
			}

			// Make a copy of the tags array and filter out the tag to remove
			icon.tags = icon.tags.filter((tag) => tag !== tagToRemove);

			// Update the icon in the array copy
			updatedIcons[iconIndex] = icon;

			return updatedIcons;
		});
	}, []);

	const handleViewModeChange = useCallback((mode: 'tags' | 'folders') => {
		setActiveViewMode(mode);
		if (mode === 'tags') {
			setActiveFolder('all');
		} else {
			setActiveTag('all');
		}
	}, []);

	// Memoized data derivations
	const allTags = useMemo(() => {
		const tags = new Set<string>();
		consolidatedIcons.forEach((icon) => {
			if (icon.tags) {
				icon.tags.forEach((tag) => tags.add(tag));
			}
		});
		return Array.from(tags).sort();
	}, [consolidatedIcons]);

	const allFolders = useMemo(() => {
		const folders = new Set<string>();
		consolidatedIcons.forEach((icon) => {
			if (icon.folder) {
				const folderName = icon.folder.split('/').filter(Boolean)[0] || icon.folder;
				folders.add(folderName);
			}
		});
		return Array.from(folders).sort();
	}, [consolidatedIcons]);

	// Memoize filtered icons for performance and maintain original indexes
	const filteredIcons = useMemo(() => {
		// Add original indices to all icons
		const indexedIcons: IndexedIconObject[] = consolidatedIcons.map((icon, index) => ({
			...icon,
			originalIndex: index,
		}));

		// Skip filtering if no filters are applied
		if (!searchTerm && activeTag === 'all' && activeFolder === 'all') {
			return indexedIcons;
		}

		let filtered = indexedIcons;

		// Filter by search term
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			filtered = filtered.filter(
				(icon) =>
					icon.name.toLowerCase().includes(term) ||
					(icon.tags && icon.tags.some((tag) => tag.toLowerCase().includes(term)))
			);
		}

		// Filter by tag or folder based on active view mode
		if (activeViewMode === 'tags' && activeTag !== 'all') {
			filtered = filtered.filter((icon) => icon.tags && icon.tags.includes(activeTag));
		} else if (activeViewMode === 'folders' && activeFolder !== 'all') {
			filtered = filtered.filter((icon) => {
				const folderName = icon.folder.split('/').filter(Boolean)[0] || icon.folder;
				return folderName === activeFolder;
			});
		}

		return filtered;
	}, [consolidatedIcons, searchTerm, activeTag, activeFolder, activeViewMode]);

	// Pagination calculations
	const totalPages = Math.max(1, Math.ceil(filteredIcons.length / itemsPerPage));
	const paginatedIcons = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredIcons.slice(startIndex, startIndex + itemsPerPage);
	}, [filteredIcons, currentPage, itemsPerPage]);

	// Navigation functions
	const goToPage = (page: number) => {
		setCurrentPage(Math.max(1, Math.min(page, totalPages)));
	};

	// Generate page items for pagination
	const getPaginationItems = () => {
		const items = [];
		const maxVisiblePages = 5;
		const ellipsisThreshold = 7;

		if (totalPages <= maxVisiblePages) {
			// Show all pages if total is small
			for (let i = 1; i <= totalPages; i++) {
				items.push(i);
			}
		} else {
			// Complex pagination with ellipsis
			if (currentPage <= 3) {
				// Near the start
				for (let i = 1; i <= 3; i++) {
					items.push(i);
				}
				items.push('ellipsis');
				items.push(totalPages);
			} else if (currentPage >= totalPages - 2) {
				// Near the end
				items.push(1);
				items.push('ellipsis');
				for (let i = totalPages - 2; i <= totalPages; i++) {
					items.push(i);
				}
			} else {
				// Middle
				items.push(1);
				items.push('ellipsis');
				items.push(currentPage - 1);
				items.push(currentPage);
				items.push(currentPage + 1);
				items.push('ellipsis');
				items.push(totalPages);
			}
		}

		return items;
	};

	const selectedIconsCount = useMemo(() => filteredIcons.filter((icon) => icon.selected).length, [filteredIcons]);

	return (
		<Card>
			<CardHeader>
				<div className='flex justify-between items-center'>
					<div>
						<CardTitle>Icon Gallery</CardTitle>
						<CardDescription>Browse and select icons for processing</CardDescription>
					</div>

					{consolidatedIcons.length > 0 && (
						<Button
							onClick={onProceedToProcessing}
							disabled={selectedIconsCount === 0}
							className='ml-auto'>
							Process {selectedIconsCount > 0 ? `${selectedIconsCount} Selected` : 'Icons'} →
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='flex flex-col sm:flex-row items-center justify-between gap-2'>
					<div className='relative w-full max-w-xl'>
						<Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
						<Input
							placeholder='Search icons or tags...'
							className='pl-8 w-full'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<div className='flex gap-2 flex-wrap'>
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

				<div className='flex justify-start gap-2 border-b pb-2'>
					<Button
						variant={activeViewMode === 'tags' ? 'secondary' : 'ghost'}
						size='sm'
						onClick={() => handleViewModeChange('tags')}>
						<Tag className='h-4 w-4 mr-2' />
						View By Tags
					</Button>
					<Button
						variant={activeViewMode === 'folders' ? 'secondary' : 'ghost'}
						size='sm'
						onClick={() => handleViewModeChange('folders')}>
						<FolderIcon className='h-4 w-4 mr-2' />
						View By Folders
					</Button>
				</div>

				{activeViewMode === 'tags' && (
					<Tabs
						defaultValue='all'
						value={activeTag}
						onValueChange={setActiveTag}>
						<TabsList className='mb-2 flex flex-wrap h-auto'>
							<TabsTrigger value='all'>All Icons ({consolidatedIcons.length})</TabsTrigger>

							{allTags.map((tag) => (
								<TabsTrigger
									key={tag}
									value={tag}
									className='flex items-center gap-1'>
									<Tag className='h-3 w-3' />
									{tag} ({consolidatedIcons.filter((icon) => icon.tags && icon.tags.includes(tag)).length})
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>
				)}

				{activeViewMode === 'folders' && (
					<Tabs
						defaultValue='all'
						value={activeFolder}
						onValueChange={setActiveFolder}>
						<TabsList className='mb-2 flex flex-wrap h-auto'>
							<TabsTrigger value='all'>All Folders ({consolidatedIcons.length})</TabsTrigger>

							{allFolders.map((folder) => {
								const iconCount = consolidatedIcons.filter((icon) => {
									const folderName = icon.folder.split('/').filter(Boolean)[0] || icon.folder;
									return folderName === folder;
								}).length;

								return (
									<TabsTrigger
										key={folder}
										value={folder}
										className='flex items-center gap-1'>
										<FolderIcon className='h-3 w-3' />
										{folder} ({iconCount})
									</TabsTrigger>
								);
							})}
						</TabsList>
					</Tabs>
				)}

				{/* Results summary */}
				{filteredIcons.length > 0 && (
					<div className='flex justify-between items-center text-sm text-muted-foreground px-1'>
						<span>
							Showing {paginatedIcons.length} of {filteredIcons.length} icons
						</span>
						<span>
							Page {currentPage} of {totalPages}
						</span>
					</div>
				)}

				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
					{paginatedIcons.length > 0 ? (
						paginatedIcons.map((icon) => (
							<IconCard
								key={`icon-${icon.name}-${icon.originalIndex}-${icon.tags?.length || 0}`}
								icon={icon}
								toggleIconSelection={toggleIconSelection}
								onAddTag={addTagToIcon}
								onRemoveTag={removeTagFromIcon}
							/>
						))
					) : consolidatedIcons.length === 0 ? (
						<div className='col-span-4 text-center py-8'>
							<FolderUp className='h-10 w-10 text-muted-foreground mx-auto mb-2' />
							<p>No icons available. Start by collecting icons in the previous step.</p>
						</div>
					) : (
						<div className='col-span-4 text-center py-8'>
							<Search className='h-10 w-10 text-muted-foreground mx-auto mb-2' />
							<p>No matching icons found. Try adjusting your search or filters.</p>
						</div>
					)}
				</div>

				{/* Pagination controls */}
				{filteredIcons.length > itemsPerPage && (
					<div className='flex justify-center items-center gap-2 pt-4 border-t select-none'>
						<Pagination>
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										onClick={() => goToPage(currentPage - 1)}
										className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
									/>
								</PaginationItem>

								{getPaginationItems().map((item, index) =>
									item === 'ellipsis' ? (
										<PaginationItem key={`ellipsis-${index}`}>
											<PaginationEllipsis />
										</PaginationItem>
									) : (
										<PaginationItem key={item}>
											<PaginationLink
												isActive={currentPage === item}
												onClick={() => goToPage(Number(item))}>
												{item}
											</PaginationLink>
										</PaginationItem>
									)
								)}

								<PaginationItem>
									<PaginationNext
										onClick={() => goToPage(currentPage + 1)}
										className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>

						{totalPages > 7 && (
							<div className='flex items-center gap-2 ml-2'>
								<span className='text-sm text-muted-foreground'>Go to:</span>
								<Select
									value={currentPage.toString()}
									onValueChange={(value) => goToPage(parseInt(value))}>
									<SelectTrigger className='min-w-16 h-8'>
										<SelectValue placeholder={currentPage} />
									</SelectTrigger>
									<SelectContent>
										{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
											<SelectItem
												key={page}
												value={page.toString()}>
												{page}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default IconDisplay;
