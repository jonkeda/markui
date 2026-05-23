export function detectTheme(): 'light' | 'dark' {
	if (typeof document === 'undefined') return 'light';
	const body = document.body;
	if (body.classList.contains('vscode-dark') || body.classList.contains('vscode-high-contrast')) {
		return 'dark';
	}
	return 'light';
}

export function getThemeForMode(mode: 'light' | 'dark', lightTheme: string, darkTheme: string): string {
	return mode === 'dark' ? darkTheme : lightTheme;
}
