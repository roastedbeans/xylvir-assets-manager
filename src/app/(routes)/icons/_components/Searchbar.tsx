'use client';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { IconComponent } from '@/types/icon-component';
import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface SearchbarProps {
	searchTerm: string;
	setSearchTerm: (value: string) => void;
	filteredIcons: IconComponent[];
	selectedFilter?: string | null;
	setSelectedFilter?: (value: string | null) => void;
	filters?: string[];
}

const Searchbar = ({
	searchTerm,
	setSearchTerm,
	filteredIcons,
	filters,
	selectedFilter,
	setSelectedFilter,
}: SearchbarProps) => {
	const [inputValue, setInputValue] = useState(searchTerm);
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Get a new searchParams string by merging the current
	// searchParams with a provided key/value pair
	const createQueryString = useCallback(
		(name: string, value: string) => {
			const params = new URLSearchParams(searchParams.toString());
			if (value) {
				params.set(name, value);
			} else {
				params.delete(name);
			}

			return params.toString();
		},
		[searchParams]
	);

	const handleFilterChange = (filter: string) => {
		setSelectedFilter?.(filter);
		// Update URL with filter parameter
		router.push(pathname + '?' + createQueryString('filter', filter));
	};

	const clearFilters = () => {
		setSelectedFilter?.(null);
		setSearchTerm('');
		setInputValue('');
		// Clear all URL parameters
		router.push(pathname);
	};

	const handleInputChange = (value: string) => {
		setInputValue(value);
		setIsLoading(true);
		setTimeout(() => {
			setSearchTerm(value);
			setIsLoading(false);
			// Update URL with search parameter
			if (value.trim()) {
				router.push(pathname + '?' + createQueryString('search', value.trim()));
			} else {
				// If search is empty, remove search param but keep others
				const params = new URLSearchParams(searchParams.toString());
				params.delete('search');
				const newQuery = params.toString();
				router.push(pathname + (newQuery ? '?' + newQuery : ''));
			}
		}, 500);
	};

	return (
		<div className='mb-6'>
			<div className='flex items-center gap-2 relative'>
				<div className='relative w-full'>
					<Input
						type='text'
						placeholder='Search icons...'
						value={inputValue}
						className='w-full bg-white'
						onChange={(e) => {
							handleInputChange(e.target.value);
						}}
					/>
					{isLoading && (
						<div className='absolute right-10 top-1/2 -translate-y-1/2'>
							<Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
						</div>
					)}
					{inputValue && (
						<Button
							className='absolute right-2 text-destructive top-1/2 -translate-y-1/2'
							variant='ghost'
							size='icon'
							onClick={clearFilters}>
							<X className='h-4 w-4' />
						</Button>
					)}
				</div>
				{filters && filters.length > 0 && (
					<div className='relative max-w-40 w-full'>
						<Select
							value={selectedFilter || ''}
							onValueChange={handleFilterChange}>
							<SelectTrigger className='max-w-40 w-full bg-white '>
								<SelectValue placeholder='Select a filter' />
							</SelectTrigger>
							<SelectContent>
								{filters?.map((filter, index) => (
									<SelectItem
										key={filter + index}
										value={filter}>
										{filter}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{selectedFilter && (
							<Button
								variant='ghost'
								size='icon'
								className='absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 p-0 text-destructive hover:bg-transparent'
								onClick={() => setSelectedFilter?.(null)}>
								<X className='h-3 w-3' />
							</Button>
						)}
					</div>
				)}
			</div>
			<div className='mt-2 text-sm text-secondary-foreground'>
				{isLoading ? (
					<span className='flex items-center gap-1'>
						<Loader2 className='h-3 w-3 animate-spin' />
						Searching...
					</span>
				) : (
					<>
						Showing {filteredIcons.length} icons
						{selectedFilter && ` (${selectedFilter})`}
					</>
				)}
			</div>
		</div>
	);
};

export default Searchbar;
