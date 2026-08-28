import { useLayoutEffect, useRef, useState } from 'react';
import { computeModuleGraph } from '../utils/moduleGraph';

const NS = 'http://www.w3.org/2000/svg';

export default function ModuleGraph({state}) {
	const svgRef = useRef(null);
	const [graph, setGraph] = useState({viewBox: '0 0 340 420', width: 340, height: 420, boxes: [], edges: []});

	useLayoutEffect(() => {
		const svg = svgRef.current;
		if (!svg) return;

		// Hidden measurer node appended to the real SVG so getComputedTextLength() reflects
		// the actual font/class styling (CSS-accurate, unlike guessing metrics).
		const measurer = document.createElementNS(NS, 'text');
		measurer.setAttribute('class', 'node-label');
		measurer.style.visibility = 'hidden';
		svg.appendChild(measurer);

		function measureTextWidth(str) {
			measurer.textContent = str;
			return measurer.getComputedTextLength();
		}

		const nextGraph = computeModuleGraph(state, measureTextWidth);
		svg.removeChild(measurer);
		setGraph(nextGraph);

		// Center the scroll position on the "app" box, same as centerGraphScroll().
		const panel = svg.closest('.graph-panel');
		if (panel && nextGraph.positions.app) {
			const appCenterPx = nextGraph.appCenterX - nextGraph.viewBoxMinX;
			panel.scrollLeft = Math.max(0, appCenterPx / 2);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state]);

	return (
		<svg
			ref={svgRef}
			viewBox={graph.viewBox}
			width={graph.width}
			height={graph.height}
			className="module-graph"
			id="moduleGraph"
		>
			{graph.edges.map((edge) => (
				<line key={edge.key} x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2} className="edge-line"/>
			))}
			{graph.boxes.map((box) => (
				<g key={box.label}>
					<rect x={box.x} y={box.y} width={box.w} height={box.h} rx={3} className={`node-box ${box.cls}`}/>
					<text
						x={box.x + box.w / 2}
						y={box.y + box.h / 2}
						textAnchor="middle"
						dominantBaseline="central"
						className="node-label"
					>
						{box.displayLabel}
					</text>
				</g>
			))}
		</svg>
	);
}
