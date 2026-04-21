import { track } from "@vercel/analytics";

type AnalyticsEvents = {
	audio_install_copied: {
		audioName: string;
		packageManager: string;
		installMethod: string;
	};
	batch_install_copied: { count: number; packageManager: string };
	audio_downloaded: { audioName: string };
	audio_previewed: { audioName: string };
	audio_detail_opened: { audioName: string };
	search_used: { query: string };
	batch_selection_changed: { action: "add" | "remove"; count: number };
	package_manager_changed: { value: string };
	install_method_changed: { value: string };
	theme_toggled: { theme: string };
	external_link_clicked: { url: string; label: string };
};

export function trackEvent<E extends keyof AnalyticsEvents>(
	event: E,
	...args: AnalyticsEvents[E] extends Record<string, never>
		? []
		: [AnalyticsEvents[E]]
) {
	track(event, args[0] as Record<string, string | number | boolean>);
}
