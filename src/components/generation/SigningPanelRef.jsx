import PasswordField from '../PasswordField';
import { forwardRef } from "react";

export const SigningPanelRef =
	forwardRef((props, ref) => {
		const {signing} = props.state;
		const setS = props.actions.setSigningField;

		return <form ref={ref}>
			<div className="panel">
				<div className="panel-head">
					<span className="material-symbols-outlined">checkbook</span>
					<span className="tag">06</span>
					<h2>Release Signing</h2>
				</div>
				<div className="field-row">
					<label>
						Store File Name
						<input name="storeFilename" type="text" value={signing.storeFilename}
					   		onChange={(e) => setS('storeFilename', e.target.value)}/>
					</label>
					<label>
						Store Password
						<PasswordField
							name="storePassword"
							className="mono"
							value={signing.storePassword}
							onChange={(v) => setS('storePassword', v)}
						/>
					</label>
				</div>
				<div className="field-row">
					<label>
						Key Alias
						<input name="keyAlias" type="text" className="mono" value={signing.keyAlias}
					   		onChange={(e) => setS('keyAlias', e.target.value)}/>
					</label>
					<label>
						Key Password
						<PasswordField name="keyPassword" className="mono" value={signing.keyPassword}
					   		onChange={(v) => setS('keyPassword', v)}/>
					</label>
				</div>
			</div>
		</form>
	})
