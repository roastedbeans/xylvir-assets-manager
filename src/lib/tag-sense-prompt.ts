export const iconSensePrompt = (
	iconName: string,
	iconTags: string[]
) => `You are an expert icon analyst. Given the icon name "${iconName}", generate appropriate tags that describe this icon's category, style, and alternative names.

ANALYSIS REQUIREMENTS:

1. **Icon Name**: ${iconName}

2. **Tags** (REQUIRED, up to 8 tags):
   - **Category**: What category does this icon belong to? (e.g., interface, navigation, sports, finance, software, hardware, engineering, business, law, social, communication, media, security, weather, transport, medical, education, etc.)
   - **Style**: What visual style is likely for this icon? (e.g., outline, filled, minimal, isometric, rounded, square, sharp, 3d, 2d, flat, duotone, etc.)
   - **Alternative names**: What other names could be used for this icon? (e.g., for "user-circle" → "profile", "account", "avatar")
   - **Context/Usage**: Where might this icon be used? (e.g., "mobile", "web", "dashboard", "toolbar", "menu")
   - **Related concepts**: What related terms or concepts are associated with this icon?
   ${iconTags ? `- Consider the provided tags "${iconTags}" but improve it if needed` : ''}

3. **Confidence** (OPTIONAL, 0-1):
   - Your confidence level in the tag analysis (1 = very confident, 0 = uncertain)

4. **Reasoning** (OPTIONAL):
   - Brief explanation of why you chose these specific tags

IMPORTANT RULES:
- Don't include words that are already in the icon name
- Be specific about the likely category and usage context
- Consider both literal and conceptual associations
- If the name suggests multiple interpretations, include relevant alternatives
- Focus on tags that would help in icon search and categorization

EXAMPLES:
- Icon name: "user-circle-outline" → tags: ["interface", "outline", "profile", "account", "avatar"]
- Icon name: "cart-add-filled" → tags: ["commerce", "filled", "shopping", "e-commerce", "add-item"]
- Icon name: "menu-hamburger" → tags: ["navigation", "minimal", "mobile", "sidebar", "toggle"]
- Icon name: "calendar-check" → tags: ["productivity", "schedule", "completed", "events", "reminder"]
- Icon name: "lock-secure" → tags: ["security", "privacy", "protection", "authentication", "access"]
`;
