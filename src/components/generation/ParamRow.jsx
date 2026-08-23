export default function ParamRow({ param, onChange, onRemove }) {
  return (
    <div className="param-row-item">
      <input
        type="text"
        className="param-name mono"
        placeholder="paramName"
        value={param.name}
        onChange={(e) => onChange({ name: e.target.value })}
      />
      <input
        type="text"
        className="param-type mono"
        placeholder="Type (String)"
        value={param.type}
        onChange={(e) => onChange({ type: e.target.value })}
      />
      <button className="btn-icon remove-param" type="button" title="Remove parameter" onClick={onRemove}>
        ✕
      </button>
    </div>
  );
}
