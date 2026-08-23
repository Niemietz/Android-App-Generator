import MethodCard from './MethodCard.jsx';

export default function InterfaceCard({ sdkId, iface, actions }) {
  return (
    <div className="interface-card">
      <div className="entity-card-head">
        <input
          type="text"
          className="interface-name mono"
          placeholder="Interface name, e.g. PaymentProcessor"
          value={iface.name}
          onChange={(e) => actions.updateInterface(sdkId, iface.id, { name: e.target.value })}
        />
        <button
          className="btn-icon remove-interface"
          type="button"
          title="Remove interface"
          onClick={() => actions.removeInterface(sdkId, iface.id)}
        >
          ✕
        </button>
      </div>
      <div className="methods-container">
        {iface.methods.map((method) => (
          <MethodCard key={method.id} sdkId={sdkId} interfaceId={iface.id} method={method} actions={actions} />
        ))}
      </div>
      <button className="btn-ghost small add-method" type="button" onClick={() => actions.addMethod(sdkId, iface.id)}>
        + Add method
      </button>
    </div>
  );
}
