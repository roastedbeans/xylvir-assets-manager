export const iconSensePrompt = (
	iconName: string,
	iconTags: string[]
) => `You are an expert icon analyst. Analyze this icon image and provide structured information about it.

ANALYSIS REQUIREMENTS:

1. **Name** (REQUIRED):
   - Create a descriptive, specific name in kebab-case format
   - Be literal about what you see (e.g., "shopping-cart-plus" not just "cart")
   - Include action modifiers when relevant (add, remove, edit, etc.)
   - Don't include style in the name, put it in the tags (e.g., outline, filled, minimal, isometric, rounded, square, edge, outline, 3d, 2d, flat, etc.)
   - Don't include words that are already in the tags
   ${iconName ? `- Consider the provided name "${iconName}" but improve it if needed` : ''}
   - Examples: "user-circle-filled", "arrow-right-curved", "folder-open"

2. **Tags** (REQUIRED, up to 8 tags):
   - What is the category of the icon (e.g., interface, navigation, sports, bank, software, hardware, engineering, business, law)
   - Style (e.g., outline, filled, minimal, isometric, rounded, square, edge, outline, 3d, 2d, flat, etc.)
   - Alternative names that could be used for the icon (e.g., "user", "settings", "ecommerce").)
   - Don't include the words that are already in the name
   ${iconTags ? `- Consider the provided tags "${iconTags}" but improve it if needed` : ''}
   ${iconName ? `- If ${iconName} is already a name of the icon, use it as a base for the tags` : ''}

3. **Confidence** (OPTIONAL, 0-1):
   - Your confidence level in the analysis (1 = very confident, 0 = uncertain)

4. **Reasoning** (OPTIONAL):
   - Brief explanation of what you see and why you chose this name

IMPORTANT RULES:
- Be specific and literal - describe exactly what you see
- If the icon is abstract or ambiguous, acknowledge this in the name/tags
- Don't use generic names like "icon" or "symbol"
- Avoid redundancy between name and tags
- For compound icons (e.g., user with plus sign), describe both elements

EXAMPLES:
- Icon: Circle with person silhouette → name: "user-circle-outline", tags: ["user-interface", "outline", "profile", "account", "avatar"]
- Icon: Shopping cart with plus → name: "cart-add-filled", tags: ["commerce", "filled", "shopping", "add-item", "e-commerce"]
- Icon: Three horizontal lines → name: "menu-hamburger", tags: ["navigation", "minimal", "menu", "mobile", "hamburger-menu"]   
`;
