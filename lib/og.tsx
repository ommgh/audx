import { ImageResponse } from "next/og";
import { generateAudioWaves } from "@/lib/audio-data";

export const OG_SIZE = { width: 1200, height: 630 };

const BG = "#0a0a0a";
const FG = "#fafafa";
const MUTED = "#a1a1a1";
const PRIMARY = "#2f5bea";

/**
 * 1200×630 social card in the site's dark palette: eyebrow, big title,
 * subtitle, and the same seeded waveform bars the site uses for each sound.
 */
export function renderOgImage({
	eyebrow,
	title,
	subtitle,
	seed,
	footer = "npx @litlab/audx init",
}: {
	eyebrow: string;
	title: string;
	subtitle: string;
	seed: string;
	footer?: string;
}) {
	const bars = generateAudioWaves(seed);

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				background: BG,
				color: FG,
				padding: "64px 72px",
				fontFamily: "sans-serif",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
				<div
					style={{
						display: "flex",
						fontSize: 34,
						fontWeight: 700,
						letterSpacing: -1,
					}}
				>
					audx
				</div>
				<div
					style={{
						display: "flex",
						fontSize: 22,
						color: PRIMARY,
						border: `1px solid ${PRIMARY}`,
						borderRadius: 999,
						padding: "4px 16px",
					}}
				>
					{eyebrow}
				</div>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
				<div
					style={{
						display: "flex",
						fontSize: 76,
						fontWeight: 700,
						letterSpacing: -2,
						lineHeight: 1.05,
						maxWidth: 1000,
					}}
				>
					{title}
				</div>
				<div
					style={{
						display: "flex",
						fontSize: 30,
						color: MUTED,
						lineHeight: 1.35,
						maxWidth: 940,
					}}
				>
					{subtitle}
				</div>
			</div>

			<div
				style={{
					display: "flex",
					alignItems: "flex-end",
					justifyContent: "space-between",
				}}
			>
				<div
					style={{
						display: "flex",
						fontSize: 26,
						fontFamily: "monospace",
						color: FG,
						background: "#171717",
						border: "1px solid #262626",
						borderRadius: 10,
						padding: "12px 20px",
					}}
				>
					{footer}
				</div>
				<div
					style={{
						display: "flex",
						alignItems: "flex-end",
						gap: 7,
						height: 96,
					}}
				>
					{bars.map((bar, i) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative bars
							key={i}
							style={{
								width: 10,
								height: `${bar.height}%`,
								borderRadius: 999,
								background: i % 3 === 0 ? PRIMARY : "#3f3f46",
							}}
						/>
					))}
				</div>
			</div>
		</div>,
		OG_SIZE,
	);
}
