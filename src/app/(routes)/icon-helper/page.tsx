import React from 'react';
import IconManager from './_components/IconManager';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Icon Helper | Xylvir UI',
	description: 'Comprehensive tools for SVG icon management, processing, and optimization',
};

const IconHelperPage = () => {
	return (
		<div className='container mx-auto'>
			<div className='p-8'>
				<h1 className='text-3xl font-bold mb-2'>Icon Management System</h1>
				<p className='text-muted-foreground'>
					Collect, process, optimize, and export SVG icons with a streamlined workflow
				</p>
			</div>
			<IconManager />
		</div>
	);
};

export default IconHelperPage;
