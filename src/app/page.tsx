import HeroPage from './_components/HeroPage';
import { Metadata } from 'next';

const metadata: Metadata = {
	title: 'Xylvir Assets Manager',
	description: 'An AI-powered asset manager for your UI and diagrams',
};

export default function Home() {
	return <HeroPage />;
}
