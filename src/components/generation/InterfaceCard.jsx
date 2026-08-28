import MethodCard from './MethodCard';

export default function InterfaceCard({sdkIndex, interfaceIndex, sdkId, iface, actions}) {
	const interfaceName = `interfaceName_${interfaceIndex}_${sdkIndex}`;

	return (
		<div className="interface-card">
			<div className="entity-card-head">
				<label className="interface-name mono">
					<input
						name={interfaceName}
						type="text"
						placeholder="Interface name, e.g. PaymentProcessor"
						value={iface.name}
						onChange={(e) => actions.updateInterface(sdkId, iface.id, {name: e.target.value})}
					/>
				</label>
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
				{iface.methods.map((method, index) => (
					<MethodCard sdkIndex={sdkIndex} interfaceIndex={interfaceIndex} methodIndex={index} key={method.id}
					            sdkId={sdkId} interfaceId={iface.id} method={method} actions={actions}/>
				))}
			</div>
			<button className="btn-ghost small add-method" type="button"
			        onClick={() => actions.addMethod(sdkId, iface.id)}>
				+ Add method
			</button>
		</div>
	);
}
