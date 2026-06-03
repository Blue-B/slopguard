import type { Lang } from "@/lib/i18n";
import { EX, type PipeNode } from "./Landing";

/**
 * The detection pipeline diagram, lifted out of the landing page so it can be
 * the centrepiece of the dedicated /how-it-works page. Renders the intro line
 * plus the event -> agent -> policy-gate -> outcome flow.
 */
export default function HowPipeline({ lang }: { lang: Lang }) {
	const x = EX[lang];
	return (
		<>
			<div className="pipe">
				{x.pipeline.nodes.map((node, i) => {
					const n = node as PipeNode;
					const last = i === x.pipeline.nodes.length - 1;
					return (
						<div className="pipe-step" key={n.k}>
						<div className={`pipe-node${n.sigs ? " pipe-engine" : ""}`}>
							<div className="pipe-head">
								<span className="pipe-num">{i + 1}</span>
								<span className="pipe-k">{n.k}</span>
							</div>
							<b className="pipe-t">{n.t}</b>
								{n.d && <p className="pipe-d">{n.d}</p>}
								{n.sigs && (
									<div className="pipe-sigs">
										{n.sigs.map((s) => (
											<div className="pipe-sig" key={s}>
												<span className="pipe-dot" />
												<span>{s}</span>
											</div>
										))}
										<div className="pipe-score">{n.score}</div>
									</div>
								)}
								{n.branch && (
									<div className="pipe-branch">
										<span className="b-clean">{n.branch[0]}</span>
										<span className="b-flag">{n.branch[1]}</span>
									</div>
								)}
								{n.tags && (
									<div className="pipe-tags">
										{n.tags.map((tg) => (
											<code key={tg}>{tg}</code>
										))}
									</div>
								)}
							</div>
							{!last && <span className="pipe-arrow" aria-hidden="true" />}
						</div>
					);
				})}
			</div>
		</>
	);
}
