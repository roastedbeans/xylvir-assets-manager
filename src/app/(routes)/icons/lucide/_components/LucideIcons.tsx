'use client';

import React, { useState, useMemo, FC } from 'react';
import LucideIcons from 'lucide-react/dynamicIconImports';
import dynamic from 'next/dynamic';
import IconCards from '@/app/(routes)/icons/_components/IconCards';
import { IconComponent } from '@/types/icon-component';
import Searchbar from '@/app/(routes)/icons/_components/Searchbar';

const DEFAULT_SIZE = 24;

export default function AllLucideIcons() {
	const [searchTerm, setSearchTerm] = useState('');

	type IconName = keyof typeof LucideIcons;

	const icons = Object.keys(LucideIcons) as IconName[];

	type ReactComponent = FC<{ className?: string }>;
	const icons_components = {} as Record<IconName, ReactComponent>;

	// Pre-load all icon components
	for (const name of icons) {
		const NewIcon = dynamic(LucideIcons[name], {
			ssr: false,
		}) as ReactComponent;
		if (NewIcon) {
			icons_components[name] = NewIcon;
		}
	}

	// Create icon components array
	const iconComponents: IconComponent[] = useMemo(() => {
		return Object.entries(icons_components)
			.filter(([_, Component]) => Component !== undefined)
			.map(([name, Component]) => {
				const IconWrapper: React.FC<{ className?: string }> = ({ className }) => {
					return <Component className={className} />;
				};

				return {
					name,
					displayName: name
						.split(/(?=[A-Z])/)
						.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
						.join(' '),
					Component: IconWrapper,
					size: DEFAULT_SIZE,
				};
			});
	}, []);

	// Filter icons based on search term if provided
	const filteredIcons = useMemo(() => {
		if (!searchTerm) return iconComponents;
		return iconComponents.filter((icon) => icon.name.toLowerCase().includes(searchTerm.toLowerCase()));
	}, [iconComponents, searchTerm]);

	return (
		<div className='sm:p-8 p-4 bg-secondary min-h-screen'>
			<h1 className='text-2xl font-bold'>Lucide Icons</h1>
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
