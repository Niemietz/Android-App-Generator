import { forwardRef, useState } from 'react';
import { validateForm } from "../../utils/formValidation.js";
import { extraScreensSchema } from "../../utils/extraScreens.js";

export const ExtraScreensPanelRef =
	forwardRef((props, ref) => {
		const [value, setValue] = useState('');

		const submit = (e) => {
			e.preventDefault();

			if (!validateForm(extraScreensSchema, [e.target])) {
				return;
			}

			const trimmed = value.trim();
			if (trimmed) {
				props.actions.addExtraScreen(trimmed);
				setValue('');
			}
		};

		return <form ref={ref} onSubmit={submit}>
			<div className="panel">
				<div className="panel-head">
					<span className="material-symbols-outlined">display_add</span>
					<span className="tag">04</span>
					<h2>Extra screens</h2>
				</div>
				<p className="hint">
					Optional blank Composable stubs for screens not tied to a single entity (e.g. Settings, About).
				</p>
				<div className="field-row">
					<input
						name="screenName"
						type="text"
						placeholder="e.g. Settings"
						value={value}
						onChange={(e) => setValue(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								submit();
							}
						}}
					/>
					<button type="submit" disabled={props.busy} className="btn-ghost">
						+ Add
					</button>
				</div>
				<div className="chips">
					{props.state.extraScreens.map((name, idx) =>
						<div key={idx}>
							<span className="chip" key={`${name}-${idx}`}>
								{name}
								<button type="button" onClick={() => props.actions.removeExtraScreen(idx)}>✕</button>
							</span>
							<input name={`name_${idx}`} value={name} style={{display: "none"}} defaultValue="" onChange={(e) => null} />
						</div>
					)}
				</div>
			</div>
		</form>
	})
