'use client';

import React from 'react';
import { IconComponent, IconType } from '@/types/icon-component';
import Image from 'next/image';

// Function to load icons from different JSON files
export const loadIconsFromCollection = async (collection: string): Promise<IconComponent[]> => {
	try {
		let iconsData: any;

		// Dynamically import the appropriate JSON file based on collection
		switch (collection) {
			case 'isometric':
				iconsData = await import('./isometric-icons.json');
				break;
			case 'health-icons':
				iconsData = await import('./health-icons.json');
				break;
			case 'ibm-icons':
				// For simple-icons, we might need a different structure
				// For now, fallback to isometric
				iconsData = await import('./ibm-icons.json');
				break;
			case 'ibm-pictograms':
				// For cloud-native, we might need a different structure
				// For now, fallback to isometric
				iconsData = await import('./ibm-pictograms.json');
				break;
			case 'cloud-native':
				iconsData = await import('./cloud-native-icons.json');
				break;
			default:
				iconsData = await import('./isometric-icons.json');
		}

		// Handle both default export and direct export formats
		const icons = iconsData.default?.icons || iconsData.icons || {};

		// Create icon components from the loaded data
		return Object.entries(icons).map(([iconName, icon]) => {
			const iconData = icon as IconType;
			const IconComponent: React.FC<{ width?: number; height?: number }> = () => {
				return React.createElement(Image, {
					src: `/icons/${iconData.path}`,
					alt: iconName || 'Icon',
					width: iconData.width,
					height: iconData.height,
					className: 'w-full h-full',
				});
			};

			return {
				name: iconName,
				displayName: iconName
					.split('_')
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(' '),
				Component: IconComponent,
				width: iconData.width,
				height: iconData.height,
				path: `/icons/${iconData.path}`,
				tags: iconData.tags || [],
			};
		});
	} catch (error) {
		console.error(`Error loading icons from collection: ${collection}`, error);
		return [];
	}
};

// For backward compatibility, export empty array by default
const icons: IconComponent[] = [];

export default icons;
