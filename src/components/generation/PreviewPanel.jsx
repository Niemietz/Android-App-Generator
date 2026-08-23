export default function PreviewPanel({ previewContent, onClean }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <span className="tag">07</span>
        <h2>Preview</h2>
        <button className="btn-ghost" type="button" onClick={onClean}>
          Clean
        </button>
      </div>
      <pre className="hint" id="previewContent">
        {previewContent || '-'}
      </pre>
    </div>
  );
}
