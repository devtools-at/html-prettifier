/**
 * HTML Prettifier
 * Format and beautify HTML code
 *
 * Online tool: https://devtools.at/tools/html-prettifier
 *
 * @packageDocumentation
 */

function prettifyHtml(html: string, indentSize: number, useTabs: boolean): string {
  const indent = useTabs ? "\t" : " ".repeat(indentSize);
  let result = "";
  let level = 0;
  const lines = html.split(/>\s*</);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Add missing < > from split
    let formatted = i === 0 ? line : "<" + line;
    if (i < lines.length - 1) formatted += ">";

    // Decrease indent for closing tags
    if (formatted.match(/^<\//) || formatted.match(/^<[^>]+\/>/)) {
      level = Math.max(0, level - 1);
    }

    // Add indentation
    if (result) result += "\n";
    result += indent.repeat(level) + formatted;

    // Increase indent for opening tags (but not self-closing or closing tags)
    if (formatted.match(/^<[^\/!][^>]*[^\/]>/) && !formatted.match(/^<[^>]+(br|hr|img|input|meta|link|area|base|col|embed|param|source|track|wbr)[^>]*>/i)) {
      if (!formatted.match(/^<\//) && !formatted.match(/\/>/)) {
        level++;
      }
    }
  }

  return result;
}

function minifyHtml(html: string, removeComments: boolean): string {
  let result = html;

  // Remove comments
  if (removeComments) {
    result = result.replace(/<!--[\s\S]*?-->/g, "");
  }

  // Remove whitespace between tags
  result = result.replace(/>\s+</g, "><");

  // Remove leading/trailing whitespace
  result = result.trim();

  // Collapse multiple spaces to single space (but preserve spaces in text content)
  result = result.replace(/\s{2,}/g, " ");

  return result;
}

function validateHtml(html: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const tagStack: string[] = [];
  const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

  // Find all tags
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
  let match;

  while ((match = tagRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();

    // Skip comments and doctypes
    if (fullTag.startsWith('<!--') || fullTag.startsWith('<!')) continue;

    // Self-closing tag
    if (fullTag.endsWith('/>') || selfClosingTags.includes(tagName)) {
      continue;
    }

    // Closing tag
    if (fullTag.startsWith('</')) {
      if (tagStack.length === 0) {
        errors.push(`Unexpected closing tag </${tagName}> with no matching opening tag`);
      } else {
        const lastTag = tagStack.pop();
        if (lastTag !== tagName) {
          errors.push(`Mismatched tags: expected </${lastTag}> but found </${tagName}>`);
        }
      }
    } else {
      // Opening tag
      tagStack.push(tagName);
    }
  }

  // Check for unclosed tags
  if (tagStack.length > 0) {
    tagStack.reverse().forEach(tag => {
      errors.push(`Unclosed tag: <${tag}>`);
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Export for convenience
export default { encode, decode };
