import React from 'react';
import IconsCollection from './_components/IconsCollection';
import { Metadata } from 'next';

const metadata: Metadata = {
	title: 'Icons Collection',
	description: 'Icons Collection',
};

export default function IconsPage() {
	return <IconsCollection />;
}
