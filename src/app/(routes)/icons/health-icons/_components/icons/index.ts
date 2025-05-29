'use client';

import React from 'react';
import filenames from './filenames.json';
import { IconComponent } from '@/types/icon-component';
import Image from 'next/image';

// Loading component for dynamic imports
const LoadingIcon: React.FC = () => {
	return React.createElement('div', {
		className: 'w-6 h-6 bg-gray-200 rounded animate-pulse',
	});
};

// Create an array to store all icon components
const icons: IconComponent[] = filenames.map((filename: string) => {
	// Create a component that uses Next.js Image component
	const IconComponent: React.FC<{ size?: number }> = ({ size = 24 }) => {
		return React.createElement(Image, {
			src: `/icons/health-icons/${filename}.svg`,
			alt: filename,
			width: size,
			height: size,
			className: 'w-full h-full',
		});
	};

	return {
		name: filename,
		displayName: filename
			.split('_')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' '),
		Component: IconComponent,
		size: 24,
	};
});

// Export all icons
export default icons;
