import React from 'react';
import IconManager from './_components/IconManager';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Icon Helper',
	description: 'Comprehensive tools for SVG icon management, processing, and optimization',
};

const IconHelperPage = () => {
	return (
		<div className='container mx-auto'>
			<div className='p-8'>
				<h1 className='text-3xl font-bold mb-2'>Icon Management System</h1>
				<div className='text-muted-foreground space-y-4 max-w-4xl'>
					<p className='text-lg'>
						A comprehensive SVG icon management platform that transforms your icon workflow from collection to
						deployment.
					</p>

					<div className='grid md:grid-cols-3 gap-6 mt-6'>
						<div className='space-y-2'>
							<h3 className='font-semibold text-foreground'>📁 Smart Collection</h3>
							<p className='text-sm'>
								Import SVG files individually or entire folders with drag-and-drop support. Automatically detects
								duplicates, validates SVG format, and organizes icons with folder-based tagging system.
							</p>
						</div>

						<div className='space-y-2'>
							<h3 className='font-semibold text-foreground'>⚡ Intelligent Processing</h3>
							<p className='text-sm'>
								Transform icons with AI-powered naming, colorization for theme support, standardization, optimization,
								and batch processing. Features include currentColor conversion, kebab-case naming, and SVG cleanup for
								production-ready assets.
							</p>
						</div>

						<div className='space-y-2'>
							<h3 className='font-semibold text-foreground'>📦 Developer-Ready Export</h3>
							<p className='text-sm'>
								Export processed icons with JSON manifests, TypeScript definitions, and organized folder structures.
								Includes metadata, tags, dimensions, and code-ready constants for seamless integration.
							</p>
						</div>
					</div>

					<div className='border-l-4 border-primary/30 pl-4 mt-6 bg-muted/30 p-4 rounded-r-md'>
						<p className='text-sm'>
							<strong>How it works:</strong> Upload your SVG collection → Select and configure processing options →
							Apply transformations with real-time preview → Download a complete package with optimized icons, metadata
							files, and TypeScript definitions ready for your development workflow.
						</p>
					</div>
				</div>
			</div>
			<IconManager />
		</div>
	);
};

export default IconHelperPage;
