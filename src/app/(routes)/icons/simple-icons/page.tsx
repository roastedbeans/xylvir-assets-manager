import React from 'react';
import SimpleIcons from './_components/SimpleIcons';
import { Metadata } from 'next';

const metadata: Metadata = {
	title: 'Simple Icons',
	description: 'Simple Icons',
};

const page = () => {
	return <SimpleIcons />;
};

export default page;
