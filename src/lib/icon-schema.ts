import z from 'zod';

export const IconSchema = z.object({
	name: z.string().describe('Provide the best name of the icon in kebab-case'),
	tags: z.array(z.string()).describe('The tags that best describe the icon, limited to 5 fitting tags'),
});

export type IconTypes = z.infer<typeof IconSchema>;
