import { RiAddLine } from "@remixicon/react";
import { JsonLd } from "@/components/json-ld";
import { FAQ } from "@/lib/faq";

/** Render inline `code` spans in FAQ answers without pulling in markdown. */
function renderInline(text: string) {
	let offset = 0;
	return text.split(/(`[^`]+`)/g).map((part) => {
		const key = offset;
		offset += part.length;
		if (!(part.startsWith("`") && part.endsWith("`"))) return part;
		return (
			<code
				key={key}
				className="rounded bg-secondary px-1 py-0.5 font-mono text-[0.85em] text-foreground"
			>
				{part.slice(1, -1)}
			</code>
		);
	});
}

const faqJsonLd = {
	"@context": "https://schema.org",
	"@type": "FAQPage",
	mainEntity: FAQ.map(({ question, answer }) => ({
		"@type": "Question",
		name: question,
		acceptedAnswer: { "@type": "Answer", text: answer.replace(/`/g, "") },
	})),
};

export function FaqSection() {
	return (
		<section
			aria-labelledby="faq-heading"
			className="mx-auto w-full max-w-6xl border-x border-t px-6 py-12"
		>
			<JsonLd data={faqJsonLd} />
			<h2
				id="faq-heading"
				className="font-display text-2xl font-bold text-balance"
			>
				Frequently asked questions
			</h2>
			<p className="text-muted-foreground mt-2 max-w-xl text-sm">
				Everything you need to know about adding UI sound effects to your web
				app with audx.
			</p>

			<div className="mt-8 divide-y border-y">
				{FAQ.map(({ question, answer }) => (
					<details key={question} className="group py-4">
						<summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
							<h3>{question}</h3>
							<RiAddLine
								size={16}
								aria-hidden="true"
								className="text-muted-foreground shrink-0 transition-transform duration-200 group-open:rotate-45"
							/>
						</summary>
						<p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-relaxed text-pretty">
							{renderInline(answer)}
						</p>
					</details>
				))}
			</div>
		</section>
	);
}
