export default function PreviewPanel({tagName = "07", busy, previewContent, onClean}) {
	return (
		<div className="panel">
			<div className="panel-head">
				{(tagName === "07") ? <span className="material-symbols-outlined">visibility</span> : null}
				<span className="tag">{(tagName !== "07") ? <span className="material-symbols-outlined" style={{fontSize:"14px", marginTop:"3.8px"}}>visibility</span> : tagName}</span>
				<h2>Preview</h2>
				<button className="btn-ghost" type="button" disabled={busy} onClick={onClean}>
					Clean
				</button>
			</div>
			<pre className="hint" id="previewContent">
				{previewContent || '-'}
		  	</pre>
		</div>
	);
}
