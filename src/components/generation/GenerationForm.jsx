import BackendSyncPanel from './BackendSyncPanel';
import ImageCachePanel from './ImageCachePanel';
import PreviewPanel from './PreviewPanel';
import { ProjectPanelRef } from "./ProjectPanelRef";
import { EntitiesPanelRef } from "./EntitiesPanelRef";
import { ExtraScreensPanelRef } from "./ExtraScreensPanelRef";
import { ExternalSdksPanelRef } from "./ExternalSdksPanelRef";
import { SigningPanelRef } from "./SigningPanelRef";

export default function GenerationForm({
	busy,
	projectForm,
	externalSdksForm,
	extraScreenForm,
	entitiesForm,
   	releaseSigningForm,
	state,
	actions,
	previewContent,
	onClean,
	hidden
}) {
	return (
		<section id="generation-form" className={`form-column${hidden ? ' hidden' : ''}`}>
			<ProjectPanelRef ref={projectForm} state={state} actions={actions}/>
			<BackendSyncPanel state={state} actions={actions}/>
			<ImageCachePanel state={state} actions={actions}/>
			<EntitiesPanelRef ref={entitiesForm} state={state} actions={actions} busy={busy}/>
			<ExtraScreensPanelRef ref={extraScreenForm} state={state} actions={actions} busy={busy}/>
			<ExternalSdksPanelRef ref={externalSdksForm} state={state} actions={actions} busy={busy}/>
			<SigningPanelRef ref={releaseSigningForm} state={state} actions={actions}/>
			<PreviewPanel previewContent={previewContent} onClean={onClean} busy={busy}/>
			<input type="text" name="website" style={{display: "none"}} tabIndex="-1" autoComplete="off" value={state.website}
			   onChange={(e) => actions.setS('website', e.target.value)}/>
		</section>
	);
}
