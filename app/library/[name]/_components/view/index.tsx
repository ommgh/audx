"use client";

import { usePatch } from "@litlab/audx/react";
import {
	RiArrowRightSLine,
	RiCalendarLine,
	RiCheckLine,
	RiDownloadLine,
	RiFileCopyLine,
	RiPlayListLine,
	RiUserLine,
} from "@remixicon/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
	createContext,
	use,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { PatchSoundsByCategory, PatchWithStats } from "@/lib/data/patches";
import styles from "./styles.module.css";

function generateColorFromName(name: string): CSSProperties {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}

	const hue = Math.abs(hash % 360);
	const saturation = 65 + (Math.abs(hash >> 8) % 20);
	const lightness = 45 + (Math.abs(hash >> 16) % 15);
	return {
		"--color-primary": `hsl(${hue}, ${saturation}%, ${lightness}%)`,
		"--color-primary-light": `hsl(${hue}, ${saturation}%, ${lightness + 15}%)`,
		"--color-primary-dark": `hsl(${hue}, ${saturation}%, ${lightness - 10}%)`,
	} as CSSProperties;
}

function formatLoads(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
	return String(Math.round(n));
}

function formatDate(date: Date): string {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

interface PatchDetailContextValue {
	patch: PatchWithStats;
	sounds: PatchSoundsByCategory[];
}

const PatchDetailContext = createContext<PatchDetailContextValue | null>(null);

function usePatchDetail(): PatchDetailContextValue {
	const ctx = use(PatchDetailContext);
	if (!ctx) {
		throw new Error("usePatchDetail must be used within PatchDetail.Root");
	}
	return ctx;
}

function Root({
	patch,
	sounds,
	children,
}: {
	patch: PatchWithStats;
	sounds: PatchSoundsByCategory[];
	children: React.ReactNode;
}) {
	return (
		<main className={styles.main}>
			<PatchDetailContext value={{ patch, sounds }}>
				{children}
			</PatchDetailContext>
		</main>
	);
}

function Layout({ children }: { children: React.ReactNode }) {
	return <div className={styles.layout}>{children}</div>;
}

function Main({ children }: { children: React.ReactNode }) {
	return <div className={styles.content}>{children}</div>;
}

function Breadcrumb() {
	const { patch } = usePatchDetail();

	return (
		<nav className={styles.breadcrumb}>
			<Link href="/library" className={styles.link}>
				Library
			</Link>
			<span className={styles.separator}>
				<RiArrowRightSLine size={12} />
			</span>
			<span className={styles.current}>{patch.name}</span>
		</nav>
	);
}

function Description() {
	const { patch } = usePatchDetail();
	if (!patch.description) return null;
	return <p className={styles.description}>{patch.description}</p>;
}

function Header() {
	const { patch } = usePatchDetail();

	return (
		<div className={styles.header}>
			<span className={styles.title}>
				<h1 className={styles.text}>{patch.name}</h1>

				<span className={styles.detail}>
					<span className={styles.version}>v{patch.version}</span>
				</span>
			</span>

			<p className={styles.description}>{patch.description}</p>

			<div className={styles.details}>
				<span className={styles.detail}>
					<RiUserLine size={16} />
					{patch.author}
				</span>
				<div className={styles.separator} />
				<span className={styles.detail}>
					<RiDownloadLine size={16} />
					{formatLoads(patch.loads)} Installs
				</span>
				<div className={styles.separator} />

				<span className={styles.detail}>
					<RiCalendarLine size={16} />
					<span className={styles.detail}>{formatDate(patch.createdAt)}</span>
				</span>
			</div>
		</div>
	);
}

function Install() {
	const { patch } = usePatchDetail();

	const snippet = `npx @web-kits/audio add ommgh/audio --patch ${patch.name}`;

	const [copied, setCopied] = useState(false);

	const MotionCheck = motion(RiCheckLine);

	const MotionClone = motion(RiFileCopyLine);

	const props = {
		size: 14,
		initial: { opacity: 0, scale: 0.95, filter: "blur(2px)" },
		animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
		exit: { opacity: 0, scale: 0.95, filter: "blur(2px)" },
		transition: { duration: 0.18, ease: "easeInOut" },
		style: { display: "flex" },
	} as const;

	return (
		<code className={styles.snippet}>
			<span className="line">$ {snippet}</span>

			<button
				type="button"
				className={styles.copy}
				onClick={() => {
					navigator.clipboard.writeText(snippet);
					setCopied(true);
					setTimeout(() => setCopied(false), 2000);
				}}
			>
				<AnimatePresence mode="wait" initial={false}>
					{copied ? (
						<MotionCheck key="check" {...props} />
					) : (
						<MotionClone key="clone" {...props} />
					)}
				</AnimatePresence>
			</button>
		</code>
	);
}

function Sounds() {
	const { patch: patchData, sounds } = usePatchDetail();

	const patch = usePatch(`/api/patch/${patchData.name}`);

	const [playing, setPlaying] = useState<string | null>(null);

	const voiceRef = useRef<{ stop: (t?: number) => void } | null>(null);

	const playingRef = useRef<string | null>(null);

	const soundSet = useMemo(() => new Set(patch.sounds), [patch.sounds]);

	const allSounds = useMemo(
		() => sounds.flatMap((group) => group.sounds),
		[sounds],
	);

	const handlePlay = useCallback(
		(soundName: string) => {
			if (voiceRef.current) {
				voiceRef.current.stop();
				voiceRef.current = null;
			}

			if (playingRef.current === soundName) {
				playingRef.current = null;
				setPlaying(null);
				return;
			}

			if (!patch.ready) return;
			if (!soundSet.has(soundName)) return;

			const voice = patch.play(soundName);
			voiceRef.current = voice;
			playingRef.current = soundName;
			setPlaying(soundName);

			setTimeout(() => {
				if (playingRef.current === soundName) {
					playingRef.current = null;
					voiceRef.current = null;
				}
				setPlaying((current) => (current === soundName ? null : current));
			}, 3000);
		},
		[patch, soundSet],
	);

	useEffect(
		() => () => {
			if (voiceRef.current) voiceRef.current.stop();
		},
		[],
	);

	if (allSounds.length === 0) return null;

	return (
		<div className={styles.preview}>
			<h2 className={styles.title}>
				<div className={styles.icon}>
					<RiPlayListLine size={16} />
				</div>
				<span className={styles.text}>Preview Sounds</span>
			</h2>
			<div className={styles.grid}>
				{allSounds.map((sound) => {
					const isAvailable = patch.ready && soundSet.has(sound.name);
					const isPlaying = playing === sound.name;
					return (
						<button
							key={sound.id}
							type="button"
							className={styles.card}
							data-playing={isPlaying}
							data-available={isAvailable}
							onClick={() => handlePlay(sound.name)}
							disabled={!patch.ready}
							style={generateColorFromName(sound.name)}
						>
							{sound.name}
						</button>
					);
				})}
			</div>
		</div>
	);
}

export { Breadcrumb, Description, Header, Install, Layout, Main, Root, Sounds };
