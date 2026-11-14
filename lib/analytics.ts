/**
 * Thin, typed wrapper over gtag for the custom GA4 events that matter for
 * audx: which sounds people preview, which themes they pick, and whether they
 * copy an install command (the closest thing we have to a conversion).
 *
 * GA only loads on the production deployment, so every call is a silent no-op
 * in dev and preview builds.
 */

type AnalyticsEvents = {
	play_sound: { sound: string; theme: string; location: string };
	select_theme: { theme: string; location: string };
	copy_install_command: {
		sound: string;
		theme?: string;
		package_manager: string;
		location: string;
	};
	search: { search_term: string };
};

declare global {
	interface Window {
		gtag?: (...args: unknown[]) => void;
	}
}

export function trackEvent<K extends keyof AnalyticsEvents>(
	name: K,
	params: AnalyticsEvents[K],
): void {
	if (typeof window === "undefined" || typeof window.gtag !== "function")
		return;
	window.gtag("event", name, params);
}
