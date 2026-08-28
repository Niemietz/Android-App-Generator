import SdkCard from './SdkCard';

export default function ExternalSdksPanel({state, actions}) {
	return (
		<div className="panel">
			<div className="panel-head">
				<span className="tag">05</span>
				<h2>External SDKs</h2>
				<button className="btn-ghost" type="button" onClick={() => actions.addSdk()}>
					+ Add SDK
				</button>
			</div>
			<p className="hint">
				Each SDK becomes two Gradle modules: a dependency-free <code>&lt;name&gt;</code> contracts module
				(interfaces
				only) and a <code>&lt;name&gt;-implementation</code> module depending on it via{' '}
				<code>api(project(":&lt;name&gt;"))</code>, with generated stub classes bound via Hilt. Use the
				type{' '}
				<code>RemoteImage</code> for any parameter/return type that's a cached remote image.
			</p>
			<div id="sdkList">
				{state.externalSdks.map((sdk) => (
					<SdkCard key={sdk.id} sdk={sdk} actions={actions}/>
				))}
			</div>
		</div>
	);
}
