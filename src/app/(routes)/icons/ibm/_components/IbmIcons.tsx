'use client';

import React, { useState, useMemo } from 'react';
import * as CarbonIcons from '@carbon/icons-react';
import IconCards from '@/app/(routes)/icons/_components/IconCards';
import { IconComponent } from '@/types/icon-component';
import Searchbar from '../../_components/Searchbar';

// Define correct icon sizes for proper rendering
const ICON_SIZES = [16, 20, 24, 32] as const;
const DEFAULT_SIZE = 24;

export default function AllCarbonIcons() {
	const [searchTerm, setSearchTerm] = useState('');

	// Extract all icon components from CarbonIcons and filter out non-icon entries
	const iconComponents: IconComponent[] = useMemo(() => {
		return Object.entries(CarbonIcons)
			.filter(([name, component]) => {
				return (
					typeof component === 'object' &&
					name !== 'default' &&
					name !== 'getAttributes' &&
					name !== 'usePrefix' &&
					// Handle special cases that cause errors
					!name.startsWith('_')
				);
			})
			.map(([name, Component]) => {
				// Remove the size suffix from the name for display
				const displayName = name.replace(/(?:16|20|24|32)$/, '');
				// Extract size from name or use default
				let size = DEFAULT_SIZE;
				for (const iconSize of ICON_SIZES) {
					if (name.endsWith(String(iconSize))) {
						size = iconSize;
						break;
					}
				}
				return { name, displayName, Component, size };
			});
	}, []);

	// Filter icons based on search term if provided
	const filteredIcons = useMemo(() => {
		if (!searchTerm) return iconComponents;
		return iconComponents.filter((icon) => icon.name.toLowerCase().includes(searchTerm.toLowerCase()));
	}, [iconComponents, searchTerm]);

	return (
		<div className='sm:p-8 p-4 bg-secondary min-h-screen'>
			<h1 className='text-2xl font-bold'>IBM Carbon Icons</h1>
			<p className='text-secondary-foreground mb-6'>{iconComponents.length} icons available</p>

			<Searchbar
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				filteredIcons={filteredIcons}
			/>

			<IconCards icon={filteredIcons} />
		</div>
	);
}
