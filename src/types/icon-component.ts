export type IconComponent = {
	name: string;
	displayName: string;
	path: string;
	tags: string[];
	width: number;
	height: number;
	Component: React.ComponentType<any>;
};

export type IconType = {
	path: string;
	width: number;
	height: number;
	tags: string[];
};
