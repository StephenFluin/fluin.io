import MarkdownIt from 'markdown-it';
import { createHighlighterCore, type ShikiTransformer } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

/**
 * Renders post markdown, with syntax-highlighted code blocks, the same way everywhere:
 * the server (blog posts, RSS) and the admin editor's preview.
 */

/** Changing the theme? Also run `npm run generate:code-theme` to regenerate src/code-theme.css */
export const CODE_THEME = 'github-light-high-contrast';

/** Code fence labels we highlight, mapped to Shiki grammars. Other labels (or none) render as plain text. */
const GRAMMARS: Record<string, string> = {
    typescript: 'angular-ts',
    ts: 'angular-ts',
    javascript: 'javascript',
    js: 'javascript',
    html: 'angular-html',
    css: 'css',
    bash: 'shellscript',
    sh: 'shellscript',
    shell: 'shellscript',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    apache: 'apache',
    solidity: 'solidity',
};

/**
 * Shiki colors tokens with inline styles, which Angular's HTML sanitizer strips. This swaps each style
 * for classes named after the color (`sk-d73a49`) and font style (`sk-italic`), defined in src/code-theme.css.
 */
const styleToClasses: ShikiTransformer = {
    name: 'fluin:style-to-classes',
    pre(node) {
        delete node.properties['style'];
    },
    span(node) {
        const style = String(node.properties['style'] ?? '');
        delete node.properties['style'];
        const color = style.match(/(?:^|;)color:#([0-9a-f]+)/i)?.[1];
        const classes = color ? [`sk-${color.toLowerCase()}`] : [];
        for (const [property, value] of [
            ['font-style', 'italic'],
            ['font-weight', 'bold'],
            ['text-decoration', 'underline'],
            ['text-decoration', 'line-through'],
        ]) {
            if (style.includes(`${property}:${value}`)) {
                classes.push(`sk-${value}`);
            }
        }
        if (classes.length) {
            this.addClassToHast(node, classes);
        }
    },
};

export async function createMarkdownRenderer(): Promise<MarkdownIt> {
    const highlighter = await createHighlighterCore({
        themes: [import('shiki/themes/github-light-high-contrast.mjs')],
        langs: [
            import('shiki/langs/angular-ts.mjs'),
            import('shiki/langs/angular-html.mjs'),
            import('shiki/langs/javascript.mjs'),
            import('shiki/langs/css.mjs'),
            import('shiki/langs/shellscript.mjs'),
            import('shiki/langs/json.mjs'),
            import('shiki/langs/yaml.mjs'),
            import('shiki/langs/apache.mjs'),
            import('shiki/langs/solidity.mjs'),
        ],
        engine: createJavaScriptRegexEngine(),
    });

    return new MarkdownIt({
        highlight(code, label) {
            const grammar = GRAMMARS[label.toLowerCase()];
            // An empty string tells markdown-it to render the block as escaped plain text
            return grammar ? highlighter.codeToHtml(code, { lang: grammar, theme: CODE_THEME, transformers: [styleToClasses] }) : '';
        },
    });
}
