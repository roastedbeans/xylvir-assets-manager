import HeroPage from './_components/HeroPage';
import { Metadata } from 'next';

const metadata: Metadata = {
	title: 'IKWONS',
	description: 'The icons that matters',
};

export default function Home() {
	return <HeroPage />;
}
