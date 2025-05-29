import React from 'react';
import IbmIcons from './_components/IbmIcons';
import { Metadata } from 'next';

const metadata: Metadata = {
	title: 'IBM Icons',
	description: 'IBM Icons',
};

const page = () => {
	return <IbmIcons />;
};

export default page;
