import { useState } from 'react';
import ModuleGraph from './ModuleGraph';
import { buildSpecPayload, specSchema } from '../utils/spec';
import { validateFormData } from "../utils/formValidation";
import {API_BASE_URL} from '../config';
import { parseEntities, parseExternalSdks } from "../utils/panelParser";

export default function Sidebar(
	{
		state,
		view,
		busy,
		setBusy,
		projectForm,
		entitiesForm,
		extraScreenForm,
		externalSdksForm,
		releaseSigningForm,
		onToggleContact,
		onPreviewLoaded,
		statusMsg,
		setStatusMsg
	}
) {
	function cleanScreenNameField() {
		const screenNameElem = extraScreenForm.current.querySelector("input[name='screenName']")
		const screenNameErrorLabelElem = extraScreenForm.current.querySelector(".emsg")
		if (screenNameElem.value.length === 0 && screenNameErrorLabelElem) {
			screenNameElem.classList.remove("validation")
			screenNameElem.classList.remove("error")
			screenNameErrorLabelElem.remove()
		}
	}

	const getFormData = () => {
		return {
			project: Object.fromEntries(
				new FormData(projectForm.current).entries()
			),
			entities: parseEntities(new FormData(entitiesForm.current).entries()),
			extraScreens: Array.from(
					new FormData(extraScreenForm.current).entries()
				)
				.filter((field) => field[0] !== "screenName")
				.map((extraScreen, index) => extraScreen[1]),
			externalSdks: parseExternalSdks(new FormData(externalSdksForm.current).entries()),
			signing: Object.fromEntries(
				new FormData(releaseSigningForm.current).entries()
			)
		}
	}

	const handleGenerate = async () => {
		cleanScreenNameField();

		if (
			!validateFormData(
				specSchema,
				[
					projectForm.current,
					entitiesForm.current,
					externalSdksForm.current,
					releaseSigningForm.current,
				],
				getFormData(),
				(message) => {
					setStatusMsg({text: message, kind: 'error'});
					/*window.Swal?.fire({
					  title: 'Invalid input!',
					  text: message,
					  icon: 'warning',
					});*/
				}, (path) =>
					path.length === 1 &&
					path[0] === "entities" // because of the minimum amount of entities >= 1
			)
		) {
			return;
		}

		const spec = buildSpecPayload(state);

		setBusy(true);
		setStatusMsg({text: 'Generating project…', kind: ''});

		try {
			const response = await fetch(`${API_BASE_URL}/api/generate`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(spec),
			});

			if (!response.ok) {
				const body = await response.json().catch(() => ({}));
				throw new Error(body.error || 'Generation failed.');
			}

			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${spec.project.appName.replace(/\s+/g, '')}.zip`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);

			setStatusMsg({text: 'Downloaded. Unzip and open in Android Studio.', kind: 'success'});
		} catch (err) {
			setStatusMsg({text: err.message || 'Something went wrong.', kind: 'error'});
		} finally {
			setBusy(false);
		}
	};

	const handlePreview = async () => {
		cleanScreenNameField();

		if (
			!validateFormData(
				specSchema,
				[
					projectForm.current,
					entitiesForm.current,
					externalSdksForm.current,
					releaseSigningForm.current,
				],
				getFormData(),
				(message) => {
					setStatusMsg({text: message, kind: 'error'});
					/*window.Swal?.fire({
					  title: 'Invalid input!',
					  text: message,
					  icon: 'warning',
					});*/
				},
				(path) =>
					path.length === 1 &&
					path[0] === "entities" // because of the minimum amount of entities >= 1
			)
		) {
			return;
		}

		const spec = buildSpecPayload(state);

		setBusy(true);
		setStatusMsg({text: 'Previewing project…', kind: ''});

		try {
			const response = await fetch(`${API_BASE_URL}/api/preview`, {
				method: 'POST',
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(spec),
			});

			if (!response.ok) {
				const body = await response.json().catch(() => ({}));
				throw new Error(body.error || 'Preview failed.');
			}

			const json = JSON.stringify(await response.json(), null, 4);
			onPreviewLoaded(json);
			setStatusMsg({text: 'Preview loaded successfully.', kind: 'success'});
		} catch (err) {
			setStatusMsg({text: err.message || 'Something went wrong.', kind: 'error'});
		} finally {
			setBusy(false);
		}
	};

	return (
		<aside className="side-column">
			<div className="panel">
				<button className="btn-primary btn-with-no-margin" type="button" disabled={busy} onClick={onToggleContact}>
					{view === 'contact' ? (
						<>
							<span className="material-symbols-outlined">build</span>
							<span style={{verticalAlign: 'super'}}>&nbsp;Setup App</span>
						</>
					) : (
						<>
							<span className="material-symbols-outlined">mail</span>
							<span style={{verticalAlign: 'super'}}>&nbsp;Contact me</span>
						</>
					)}
				</button>
			</div>

			<div className="panel graph-panel">
				<div className="panel-head panel-head-graph">
					<span className="tag">graph</span>
					<h2>Module map</h2>
				</div>
				<ModuleGraph state={state}/>
			</div>

			<div className="panel generate-panel">
				<button className="btn-primary" type="button" disabled={busy} onClick={handlePreview}>
					Preview files
				</button>
				<button className="btn-primary" type="button" disabled={busy} onClick={handleGenerate}>
					Generate project ↓
				</button>
				<p className={`status${statusMsg.kind ? ` ${statusMsg.kind}` : ''}`}>{statusMsg.text}</p>
			</div>
		</aside>
	);
}
