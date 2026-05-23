import { markuiPlugin } from './plugin';
import { markuiStyles } from './styles';

function injectStyles(): void {
	if (typeof document === 'undefined') return;
	if (document.getElementById('markui-markdown-styles')) return;
	const style = document.createElement('style');
	style.id = 'markui-markdown-styles';
	style.textContent = markuiStyles;
	document.head.appendChild(style);
}

export function activate() {
	injectStyles();
	return {
		extendMarkdownIt(md: any) {
			return md.use(markuiPlugin, { lightTheme: 'clean', darkTheme: 'blueprint', maxSize: 50000 });
		}
	};
}
