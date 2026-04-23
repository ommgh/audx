const EQ_LOGO_HEIGHTS = [50, 90, 65, 30, 65, 90, 50];

export function EqLogo() {
	return (
		<div className="flex items-center gap-[2px] h-[18px]" aria-hidden="true">
			{EQ_LOGO_HEIGHTS.map((h, i) => (
				<span
					key={`eq-logo-${i}-${h}`}
					className="w-[2.5px] rounded-full bg-primary"
					style={{ height: `${h}%` }}
				/>
			))}
		</div>
	);
}
