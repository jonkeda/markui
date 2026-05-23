import { markuiPlugin } from './plugin';

export function activate() {
	return {
		extendMarkdownIt(md: any) {
			return md.use(markuiPlugin, { lightTheme: 'clean', darkTheme: 'blueprint', maxSize: 50000 });
		}
	};
}
