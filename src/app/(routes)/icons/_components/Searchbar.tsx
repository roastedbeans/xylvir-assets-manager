'use client';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { IconComponent } from '@/types/icon-component';
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
	const handleFilterChange = (filter: string) => {
		setSelectedFilter?.(filter);
	};

	const clearFilters = () => {
		setSelectedFilter?.(null);
		setSearchTerm('');
	};

	console.log(selectedFilter);

	return (
		<div className='mb-6'>
			<div className='flex items-center gap-2'>
				<Input
					type='text'
					placeholder='Search icons...'
					value={searchTerm}
					className='w-full bg-white'
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				{filters && filters.length > 0 && (
					<div className='relative max-w-40 w-full'>
						<Select
							value={selectedFilter || ''}
							onValueChange={handleFilterChange}>
							<SelectTrigger className='max-w-40 w-full bg-white '>
								<SelectValue placeholder='Select a filter' />
							</SelectTrigger>
							<SelectContent>
								{filters?.map((filter) => (
									<SelectItem
										className='capitalize'
										key={filter}
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
				{searchTerm && (
					<Button
						variant='ghost'
						size='icon'
						onClick={() => setSearchTerm('')}>
						<X className='h-4 w-4' />
					</Button>
				)}
			</div>
			<div className='mt-2 text-sm text-secondary-foreground'>
				Showing {filteredIcons.length} icons
				{selectedFilter && ` (${selectedFilter})`}
			</div>
		</div>
	);
};

export default Searchbar;
