'use client';

import React, { useState, useMemo, useEffect } from 'react';
import IconCards from '@/app/(routes)/icons/_components/IconCards';
import { IconComponent } from '@/types/icon-component';
import { loadIconsFromCollection } from './icons/index';
import Searchbar from '@/app/(routes)/icons/_components/Searchbar';
import { useSearchParams } from 'next/navigation';

const iconsList = ['isometric-icons', 'health-icons', 'ibm-icons', 'ibm-pictograms', 'cloud-native'];

export default function IconsCollection() {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedFilter, setSelectedFilter] = useState<string | null>(iconsList[0]);
	const [allIcons, setAllIcons] = useState<IconComponent[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const searchParams = useSearchParams();

	// Load icons when the selected filter changes
	useEffect(() => {
		const loadIcons = async () => {
			if (selectedFilter) {
				setIsLoading(true);
				try {
					const icons = await loadIconsFromCollection(selectedFilter);
					setAllIcons(icons);
				} catch (error) {
					console.error('Error loading icons:', error);
					setAllIcons([]);
				} finally {
					setIsLoading(false);
				}
			}
		};

		loadIcons();
	}, [selectedFilter]);

	// Initialize state from URL parameters
	useEffect(() => {
		const filterParam = searchParams.get('filter');
		const searchParam = searchParams.get('search');

		if (filterParam && iconsList.includes(filterParam)) {
			setSelectedFilter(filterParam);
		}

		if (searchParam) {
			setSearchTerm(searchParam);
		}
	}, [searchParams]);

	// Filter icons (now they're already from the selected collection)
	const iconComponents: IconComponent[] = useMemo(() => {
		// Since we're loading the specific collection, we just need to filter out invalid icons
		return allIcons.filter((icon) => {
			// Skip default and internal icons
			return icon.name !== 'default' && !icon.name.startsWith('_');
		});
	}, [allIcons]);

	// Apply search term filtering
	const filteredIcons = useMemo(() => {
		if (!searchTerm) return iconComponents;

		// Split search term into individual words and filter out empty strings
		const searchWords = searchTerm
			.toLowerCase()
			.split(/\s+/)
			.filter((word) => word.length > 0);

		return iconComponents.filter((icon) => {
			const iconName = icon.name.toLowerCase();
			const iconDisplayName = icon.displayName?.toLowerCase() || '';
			const iconTags = icon.tags.map((tag) => tag.toLowerCase()).join(' ');
			const searchableText = `${iconName} ${iconDisplayName} ${iconTags}`;

			// Check if ANY search word is present in the searchable text (OR logic)
			return searchWords.some((word) => searchableText.includes(word));
		});
	}, [iconComponents, searchTerm]);

	return (
		<div className='sm:p-8 p-4 bg-secondary min-h-screen'>
			<h1 className='text-2xl font-bold'>Icons Collection</h1>
			<p className='text-secondary-foreground mb-6'>{isLoading ? 'Loading...' : `${allIcons.length} total icons`}</p>

			<Searchbar
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				filteredIcons={filteredIcons}
				selectedFilter={selectedFilter}
				setSelectedFilter={setSelectedFilter}
				filters={iconsList}
			/>

			{isLoading ? (
				<div className='flex justify-center items-center h-64'>
					<div className='text-lg'>Loading {selectedFilter} icons...</div>
				</div>
			) : (
				<IconCards icon={filteredIcons} />
			)}
		</div>
	);
}
