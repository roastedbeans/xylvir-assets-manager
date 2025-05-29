'use client';

import React, { useState, useMemo } from 'react';
import IconCards from '@/app/(routes)/icons/_components/IconCards';
import { IconComponent } from '@/types/icon-component';
import icons from './icons/index';
import Searchbar from '@/app/(routes)/icons/_components/Searchbar';

const DEFAULT_SIZE = 24;

export default function AllCloudNativeIcons() {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedFilter, setSelectedFilter] = useState<string | null>();

	// Extract all icon components from icons
	const iconComponents: IconComponent[] = useMemo(() => {
		return icons
			.filter((icon) => {
				// Skip default and internal icons
				if (icon.name === 'default' || icon.name.startsWith('_')) {
					return false;
				}

				// Apply filter based on selected type
				if (selectedFilter?.toLowerCase() === 'filled') {
					return icon.name.includes('filled');
				}
				// For 'regular' or no filter, show non-filled icons
				return !icon.name.includes('filled');
			})
			.map((icon) => ({
				name: icon.name,
				displayName: icon.name
					.split('_')
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(' '),
				Component: icon.Component,
				size: DEFAULT_SIZE,
			}));
	}, [selectedFilter]); // Add selectedFilter as a dependency

	// Filter icons based on search term if provided
	const filteredIcons = useMemo(() => {
		if (!searchTerm) return iconComponents;
		return iconComponents.filter((icon) => icon.name.toLowerCase().includes(searchTerm.toLowerCase()));
	}, [iconComponents, searchTerm]);

	return (
		<div className='sm:p-8 p-4 bg-secondary min-h-screen'>
			<h1 className='text-2xl font-bold'>Cloud Native Icons</h1>
			<p className='text-secondary-foreground mb-6'>{iconComponents.length} icons available</p>

			<Searchbar
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				filteredIcons={filteredIcons}
				selectedFilter={selectedFilter}
				setSelectedFilter={setSelectedFilter}
				// filters={['Filled', 'Regular']}
			/>

			<IconCards icon={filteredIcons} />
		</div>
	);
}
