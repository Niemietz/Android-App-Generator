export default function ParamRow({sdkIndex, interfaceIndex, methodIndex, paramIndex, param, onChange, onRemove}) {
	const methodName = `paramName_${paramIndex}_${methodIndex}_${interfaceIndex}_${sdkIndex}`;
	const typeName = `type_${paramIndex}_${methodIndex}_${interfaceIndex}_${sdkIndex}`;

	return (
		<div className="param-row-item">
			<label className="param-name mono">
				<input
					name={methodName}
					type="text"
					placeholder="paramName"
					value={param.name}
					onChange={(e) => onChange({name: e.target.value})}
				/>
			</label>
			<label className="param-type mono">
				<input
					name={typeName}
					type="text"
					placeholder="Type (String)"
					value={param.type}
					onChange={(e) => onChange({type: e.target.value})}
				/>
			</label>
			<button className="btn-icon remove-param" type="button" title="Remove parameter" onClick={onRemove}>
				✕
			</button>
		</div>
	);
}
