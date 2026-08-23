const FIELD_TYPES = [
  ['String', 'String'],
  ['Int', 'Int'],
  ['Long', 'Long'],
  ['Double', 'Double'],
  ['Boolean', 'Boolean'],
  ['Date', 'Date'],
  ['Image', 'Image (remote, cached)'],
];

export default function FieldRow({ field, entityIndex, fieldIndex, onChange, onRemove }) {
    const entityFieldName = `field_${fieldIndex}_${entityIndex}`

    return (
    <div className="field-row-item">
      <label className="field-name mono">
        <input
            name={entityFieldName}
            type="text"
            placeholder="title"
            value={field.name}
            onChange={(e) => onChange({ name: e.target.value })}
        />
      </label>
      <select className="field-type" value={field.type} onChange={(e) => onChange({ type: e.target.value })}>
        {FIELD_TYPES.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <input
        type="checkbox"
        className="field-nullable"
        checked={field.nullable}
        onChange={(e) => onChange({ nullable: e.target.checked })}
      />
      <button className="btn-icon remove-field" type="button" title="Remove field" onClick={onRemove}>
        ✕
      </button>
    </div>
  );
}
