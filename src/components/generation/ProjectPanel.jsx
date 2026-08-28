import PasswordField from '../PasswordField';

export default function ProjectPanel({state, actions}) {
	const {project} = state;
	const setP = actions.setProjectField;

	return (<div className="panel">
		<div className="panel-head">
			<span className="tag">01</span>
			<h2>Project</h2>
		</div>

		<div className="field-row">
			<label>
				App name
				<input name="appName" type="text" value={project.appName}
			   		onChange={(e) => setP('appName', e.target.value)}/>
			</label>
			<label>
				Package name
				<input
					type="text"
					className="mono"
					value={project.packageName}
					onChange={(e) => setP('packageName', e.target.value)}
				/>
			</label>
		</div>

		<div className="field-row three">
			<label>
				Min SDK
				<input type="number" value={Number.parseInt(project.minSdk)}
		   			onChange={(e) => setP('minSdk', e.target.valueAsNumber)}/>
			</label>
			<label>
				Target SDK
				<input type="number" value={Number.parseInt(project.targetSdk)}
		   			onChange={(e) => setP('targetSdk', e.target.valueAsNumber)}/>
			</label>
			<label>
				Compile SDK
				<input type="number" value={Number.parseInt(project.compileSdk)}
		   			onChange={(e) => setP('compileSdk', e.target.valueAsNumber)}/>
			</label>
		</div>

		<div className="field-row">
			<label>
				Backend base URL
				<input type="text" className="mono" value={project.baseUrl}
			   		onChange={(e) => setP('baseUrl', e.target.value)}/>
			</label>
			<label className="checkbox-label">
				<span className="checkbox-inline">
					<span className="material-symbols-outlined">login</span>
					<input
						type="checkbox"
						checked={project.includeLogin}
						onChange={(e) => setP('includeLogin', e.target.checked)}
					/>{' '}
					Include a login screen (first screen)
				</span>
			</label>
		</div>

		<div className="field-row">
			<label className="checkbox-label">
				<span className="checkbox-inline">
					<input
						type="checkbox"
						checked={project.includeFirebase}
						onChange={(e) => actions.setIncludeFirebase(e.target.checked)}
					/>{' '}
					Include Firebase (Crashlytics, Analytics, alternative sign-in)
				</span>
			</label>
		</div>

		<div className="field-row">
			<label className="checkbox-label">
				<span className="checkbox-inline">
					<input
						type="checkbox"
						checked={project.includeGoogleMaps}
						onChange={(e) => setP('includeGoogleMaps', e.target.checked)}
					/>{' '}
					Include Google Maps
				</span>
			</label>
			<label className="checkbox-label">
				<span className="checkbox-inline">
					<input
						type="checkbox"
						checked={project.includeAzureMaps}
						onChange={(e) => setP('includeAzureMaps', e.target.checked)}
					/>{' '}
					Include Azure Maps
					<span className="material-symbols-outlined">warning</span>
					Not working properly. Microsoft documentation is a mess
				</span>
			</label>
		</div>

		<div className="field-row">
			<label>
				Google Maps API Key
				<PasswordField
					value={state.googleMapsApiKey}
					onChange={actions.setGoogleMapsApiKey}
					disabled={!project.includeGoogleMaps}
				/>
			</label>
			<label>
				Azure Maps API Key
				<PasswordField
					value={state.azureMapsApiKey}
					onChange={actions.setAzureMapsApiKey}
					disabled={!project.includeAzureMaps}
				/>
			</label>
		</div>

		<div className="field-row">
			<label className="checkbox-label">
				<span className="checkbox-inline">
					<input
						type="checkbox"
						disabled={!project.includeFirebase}
						checked={project.includeSqlConnectVariant}
						onChange={(e) => setP('includeSqlConnectVariant', e.target.checked)}
					/>{' '}
						Also generate an SQL Connect build variant (needs Firebase; extra setup required — see README)
				</span>
			</label>
			<label className="checkbox-label">
				<span>&nbsp;</span>
				<span className="checkbox-inline">
					<input
						type="checkbox"
						disabled={!project.includeFirebase}
						checked={project.includeFirestore}
						onChange={(e) => setP('includeFirestore', e.target.checked)}
					/>{' '}
					Add Firestore for arbitrary large collections (needs Firebase; separate from entity sync)
				</span>
			</label>
		</div>

		<div className="field-row">
			<label className="checkbox-label">
				<span>&nbsp;</span>
				<span className="checkbox-inline">
					<input
						type="checkbox"
						checked={project.includeLottie}
						onChange={(e) => setP('includeLottie', e.target.checked)}
					/>{' '}
					Add Lottie for smooth and low RAM consumption animations
				</span>
			</label>
		</div>
	</div>);
}
