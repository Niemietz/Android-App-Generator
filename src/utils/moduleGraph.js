import { previewModuleName, specUsesImages } from './spec';

const WIDTH = 340;
const PAD_X = 16; // horizontal padding inside the box (8px each side)
const MIN_W = 50;
const MAX_W = 140;

function displayLabelFor(label, cls) {
	const base = cls === 'core' ? label.replace('core-', '') : label;
	return base.length > 14 ? `${base.slice(0, 13)}…` : base;
}

/**
 * Computes box/edge positions for the module dependency graph.
 * `measureTextWidth` must be backed by a live SVG <text> node (getComputedTextLength)
 * so sizing matches the actual font/class styling — see ModuleGraph.jsx.
 */
export function computeModuleGraph(state, measureTextWidth) {
	const coreModules = ['core-common', 'core-ui', 'core-database', 'core-network'];
	if (state.project.includeLogin) coreModules.push('core-auth');
	if (specUsesImages(state)) coreModules.push('core-image');
	if (state.project.includeFirebase) coreModules.push('core-firebase');
	if (state.project.includeFirestore) coreModules.push('core-firestore');
	if (state.project.includeLottie) coreModules.push('core-lottie');
	if (state.project.includeGoogleMaps) coreModules.push('google-maps');
	if (state.project.includeAzureMaps) coreModules.push('azure-maps');
	if (state.project.includeGoogleMaps || state.project.includeAzureMaps) coreModules.push('core-maps');

	const features = state.entities.map((e) => `feature-${(e.name || 'entity').toLowerCase()}`);
	const sdkModules = state.externalSdks.flatMap((sdk) => {
		const m = previewModuleName(sdk.name);
		return [m, `${m}-impl`];
	});

	const rows = [
		{y: 20, boxes: [{label: 'app', cls: 'app'}]},
		{y: 90, boxes: features.map((f) => ({label: f, cls: 'feature'}))},
		{
			y: 90 + Math.max(1, Math.ceil(features.length / 2)) * 46 + 20,
			boxes: coreModules.map((c) => ({label: c, cls: 'core'}))
		},
	];
	if (sdkModules.length > 0) {
		rows.push({y: rows[2].y + 56, boxes: sdkModules.map((s) => ({label: s, cls: 'sdk'}))});
	}

	const height = rows[rows.length - 1].y + 60;

	// --- layout: size each box to its own text, then lay out the row -----
	const positions = {};
	rows.forEach((row) => {
		const gap = 10;

		const sized = row.boxes.map((box) => {
			const displayLabel = displayLabelFor(box.label, box.cls);
			const textW = measureTextWidth(displayLabel);
			const boxW = Math.min(MAX_W, Math.max(MIN_W, textW + PAD_X));
			return {...box, displayLabel, w: boxW};
		});

		const totalW = sized.reduce((sum, b) => sum + b.w, 0) + (sized.length - 1) * gap;
		let x = (WIDTH - totalW) / 2;

		sized.forEach((box) => {
			positions[box.label] = {
				x,
				y: row.y,
				w: box.w,
				h: 30,
				cls: box.cls,
				displayLabel: box.displayLabel,
			};
			x += box.w + gap;
		});
	});

	// Edges: app -> each feature, each feature -> each core module
	const edgePairs = [];
	features.forEach((f) => edgePairs.push(['app', f]));
	features.forEach((f) => coreModules.forEach((c) => edgePairs.push([f, c])));
	if (features.length === 0) coreModules.forEach((c) => edgePairs.push(['app', c]));

	const edges = edgePairs
		.map(([from, to]) => {
			const a = positions[from];
			const b = positions[to];
			if (!a || !b) return null;
			return {
				key: `${from}->${to}`,
				x1: a.x + a.w / 2,
				y1: a.y + a.h,
				x2: b.x + b.w / 2,
				y2: b.y,
			};
		})
		.filter(Boolean);

	const boxes = Object.entries(positions).map(([label, pos]) => ({label, ...pos}));

	const allX = boxes.flatMap((p) => [p.x, p.x + p.w]);
	const minX = Math.min(0, ...allX);
	const maxX = Math.max(WIDTH, ...allX);
	const contentWidth = maxX - minX;

	return {
		viewBox: `${minX} 0 ${contentWidth} ${height}`,
		width: contentWidth,
		height,
		boxes,
		edges,
		positions,
		appCenterX: positions.app ? positions.app.x + positions.app.w / 2 : 0,
		viewBoxMinX: minX,
	};
}
