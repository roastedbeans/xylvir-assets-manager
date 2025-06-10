'use server';

import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';
import { IconSchema } from '@/lib/icon-schema';
import { convertSvgToPng } from '@/lib/image-processor';
import { iconSensePrompt } from '@/lib/icon-sense-prompt';

const MODEL_NAME = 'gpt-4o-mini';

const cleanKebabCase = (input: string): string =>
	input
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');

const cleanTags = (tags: unknown): string[] => {
	if (!Array.isArray(tags)) return ['icon'];
	return tags.filter((t) => typeof t === 'string' && t.trim().length > 0).map((t) => t.toLowerCase().trim());
};

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { iconName, iconTags } = body;

		if (!iconName || typeof iconName !== 'string') {
			return NextResponse.json({ error: 'Missing or invalid "iconName" input' }, { status: 400 });
		}

		const visionModel = new ChatOpenAI({
			apiKey: process.env.OPENAI_API_KEY,
			model: MODEL_NAME,
			temperature: 0.3,
			maxTokens: 500,
		}).withStructuredOutput(IconSchema);

		const message = new HumanMessage({
			content: [
				{
					type: 'text',
					text: iconSensePrompt(iconName, iconTags),
				},
			],
		});

		const result = await visionModel.invoke([message]);

		if (!result || typeof result.name !== 'string' || !Array.isArray(result.tags)) {
			console.error('Invalid model output:', result);
			return NextResponse.json({ error: 'Invalid model response format', name: '', tags: [] }, { status: 500 });
		}

		const name = cleanKebabCase(result.name) || 'unknown-icon';
		const tags = cleanTags(result.tags);

		return NextResponse.json({ name, tags });
	} catch (err) {
		console.error('Icon analysis failed:', err);
		return NextResponse.json(
			{ error: 'Internal server error during icon analysis', name: '', tags: [] },
			{ status: 500 }
		);
	}
}
