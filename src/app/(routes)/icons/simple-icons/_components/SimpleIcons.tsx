'use client';

import React, { useState, useMemo } from 'react';
import * as icons from 'simple-icons';
import type { SimpleIcon } from 'simple-icons';
import { IconComponent } from '@/types/icon-component';
import Searchbar from '@/app/(routes)/icons/_components/Searchbar';
import IconCards from '@/app/(routes)/icons/_components/IconCards';

const DEFAULT_SIZE = 24;

const SimpleIcons = () => {
	const [searchTerm, setSearchTerm] = useState('');

	const simpleIcons = Object.values(icons) as SimpleIcon[];

	const iconComponents: IconComponent[] = useMemo(() => {
		const filteredIcons = !searchTerm
			? simpleIcons
			: simpleIcons.filter((icon) => icon.title.toLowerCase().includes(searchTerm.toLowerCase()));

		return filteredIcons.map((icon) => {
			const IconComponent: React.FC<{ className?: string }> = ({ className }) => (
				<svg
					role='img'
					viewBox='0 0 24 24'
					xmlns='http://www.w3.org/2000/svg'
					className={className}
					width={DEFAULT_SIZE}
					height={DEFAULT_SIZE}>
					<path d={icon.path} />
				</svg>
			);

			return {
				name: icon.title,
				displayName: icon.title,
				Component: IconComponent,
				size: DEFAULT_SIZE,
			};
		});
	}, [simpleIcons, searchTerm]);

	return (
		<div className='sm:p-8 p-4 bg-secondary min-h-screen'>
			<h1 className='text-2xl font-bold'>Simple Icons</h1>
			<p className='text-secondary-foreground mb-6'>{simpleIcons.length} icons available</p>

			<Searchbar
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				filteredIcons={iconComponents}
			/>
			<IconCards icon={iconComponents} />
		</div>
	);
};

export default SimpleIcons;
