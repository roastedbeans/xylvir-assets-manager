import React from 'react';
import AllHealthIcons from './_components/CloudNative';
import { Metadata } from 'next';

const metadata: Metadata = {
	title: 'Health Icons',
	description: 'Health Icons',
};

export default function HealthIconsPage() {
	return <AllHealthIcons />;
}
