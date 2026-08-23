import ParamRow from './ParamRow.jsx';

export default function MethodCard({ sdkId, interfaceId, method, actions }) {
  return (
    <div className="method-card">
      <div className="method-head">
        <input
          type="text"
          className="method-name mono"
          placeholder="methodName"
          value={method.name}
          onChange={(e) => actions.updateMethod(sdkId, interfaceId, method.id, { name: e.target.value })}
        />
        <input
          type="text"
          className="method-return-type mono"
          placeholder="Return type (Unit, String, RemoteImage...)"
          value={method.returnType}
          onChange={(e) => actions.updateMethod(sdkId, interfaceId, method.id, { returnType: e.target.value })}
        />
        <label className="suspend-label">
          <input
            type="checkbox"
            className="method-suspend"
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
        {method.parameters.map((param) => (
          <ParamRow
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
