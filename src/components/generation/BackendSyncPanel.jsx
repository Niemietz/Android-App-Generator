export default function BackendSyncPanel({state, actions}) {
	const {sync} = state;
	const setS = actions.setSyncField;

	return (
		<div className="panel">
			<div className="panel-head">
				<span className="material-symbols-outlined">sync</span>
				<span className="tag">02 A</span>
				<h2>Backend sync</h2>
			</div>
			<p className="hint">
				Every entity gets a Retrofit API + two-way sync against your backend. Sync always runs on app open and
				after
				every save/update/delete.
			</p>
			<div className="field-row three">
				<label>
					Max auto-retries per request
					<input type="number" min={0} value={Number.parseInt(sync.maxRetries)}
					       onChange={(e) => setS('maxRetries', e.target.valueAsNumber)}/>
				</label>
				<label className="checkbox-label">
					<span className="checkbox-inline">
						<span className="material-symbols-outlined">timer</span>
						<input
							type="checkbox"
							checked={sync.periodicSyncEnabled}
							onChange={(e) => setS('periodicSyncEnabled', e.target.checked)}
						/>{' '}
						Sync every {Number.parseInt(sync.periodicSyncIntervalMinutes)} minutes while open
				  	</span>
				</label>
				<label>
					Interval (minutes)
					<input
						type="number"
						min={1}
						disabled={!sync.periodicSyncEnabled}
						value={Number.parseInt(sync.periodicSyncIntervalMinutes)}
						onChange={(e) => setS('periodicSyncIntervalMinutes', e.target.valueAsNumber)}
					/>
				</label>
			</div>
		</div>
	);
}
