import InterfaceCard from './InterfaceCard.jsx';
import { previewModuleName } from '../../utils/spec';

export default function SdkCard({ sdkIndex, sdk, actions }) {
  const moduleName = previewModuleName(sdk.name);

  const sdkName = `sdkName_${sdkIndex}`;

  return (
    <div className="sdk-card">
      <div className="entity-card-head">
        <label className="sdk-name mono">
            <input
                name={sdkName}
                type="text"
                placeholder="SDK name, e.g. payments-sdk"
                value={sdk.name}
                onChange={(e) => actions.updateSdk(sdk.id, { name: e.target.value })}
            />
        </label>
        <button className="btn-icon remove-sdk" type="button" title="Remove SDK" onClick={() => actions.removeSdk(sdk.id)}>
          ✕
        </button>
      </div>
      <p className="sdk-module-preview mono">
        → contracts: <span className="accent">{moduleName}</span> · implementation:{' '}
        <span className="accent">{moduleName}-implementation</span>
      </p>
      <div className="interfaces-container">
        {sdk.interfaces.map((iface, index) => (
          <InterfaceCard sdkIndex={sdkIndex} interfaceIndex={index} key={iface.id} sdkId={sdk.id} iface={iface} actions={actions} />
        ))}
      </div>
      <button className="btn-ghost small add-interface" type="button" onClick={() => actions.addInterface(sdk.id)}>
        + Add interface
      </button>
    </div>
  );
}
