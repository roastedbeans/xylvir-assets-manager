import { IconObject } from '@/types/icon-helper-types';

export const generateIconSense = async (
	icon: IconObject,
	useIconImage: boolean
): Promise<{ name: string; tags: string[] }> => {
	if (useIconImage) {
		try {
			const response = await fetch(`/api/icon-sense`, {
				method: 'POST',
				body: JSON.stringify({ icon: icon.content, iconName: icon.name, iconTags: icon.tags }),
			});

			const iconSenseData = await response.json();

			return iconSenseData;
		} catch (error) {
			console.error('Error generating icon sense:', error);
			return {
				name: '',
				tags: [],
			};
		}
	} else {
		try {
			const response = await fetch(`/api/tag-sense`, {
				method: 'POST',
				body: JSON.stringify({ iconName: icon.name }),
			});

			const tagSenseData = await response.json();

			return tagSenseData;
		} catch (error) {
			console.error('Error generating tag sense:', error);
			return {
				name: '',
				tags: [],
			};
		}
	}
};
