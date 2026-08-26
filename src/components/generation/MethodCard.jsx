import ParamRow from './ParamRow.jsx';

export default function MethodCard({ sdkIndex, interfaceIndex, methodIndex, sdkId, interfaceId, method, actions }) {
    const methodName = `methodName_${methodIndex}_${interfaceIndex}_${sdkIndex}`;
    const returnTypeName = `returnType_${methodIndex}_${interfaceIndex}_${sdkIndex}`;

    return (
    <div className="method-card">
      <div className="method-head">
        <label className="method-name mono">
          <input
            name={methodName}
            type="text"
            placeholder="methodName"
            value={method.name}
            onChange={(e) => actions.updateMethod(sdkId, interfaceId, method.id, { name: e.target.value })}
          />
        </label>
        <label className="method-return-type mono">
          <input
            name={returnTypeName}
            type="text"
            placeholder="Return type (Unit, String, RemoteImage...)"
            value={method.returnType}
            onChange={(e) => actions.updateMethod(sdkId, interfaceId, method.id, { returnType: e.target.value })}
          />
        </label>
        <label className="method-suspend">
          <input
            type="checkbox"
            checked={method.suspend}
            onChange={(e) => actions.updateMethod(sdkId, interfaceId, method.id, { suspend: e.target.checked })}
          />{' '}
          suspend
        </label>
        <button
          className="btn-icon remove-method"
          type="button"
          title="Remove method"
          onClick={() => actions.removeMethod(sdkId, interfaceId, method.id)}
        >
          ✕
        </button>
      </div>
      <div className="params-container">
        {method.parameters.map((param, index) => (
          <ParamRow
            sdkIndex={sdkIndex}
            interfaceIndex={interfaceIndex}
            methodIndex={methodIndex}
            paramIndex={index}
            key={param.id}
            param={param}
            onChange={(patch) => actions.updateParam(sdkId, interfaceId, method.id, param.id, patch)}
            onRemove={() => actions.removeParam(sdkId, interfaceId, method.id, param.id)}
          />
        ))}
      </div>
      <button
        className="btn-ghost small add-param"
        type="button"
        onClick={() => actions.addParam(sdkId, interfaceId, method.id)}
      >
        + Add parameter
      </button>
    </div>
  );
}
