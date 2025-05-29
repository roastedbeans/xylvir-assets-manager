import React from 'react';
import LucideIcons from './_components/LucideIcons';
import { Metadata } from 'next';

const metadata: Metadata = {
	title: 'Lucide Icons',
	description: 'Lucide Icons',
};

const page = () => {
	return <LucideIcons />;
};

export default page;
