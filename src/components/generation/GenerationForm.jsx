import BackendSyncPanel from './BackendSyncPanel.jsx';
import ImageCachePanel from './ImageCachePanel.jsx';
import SigningPanel from './SigningPanel.jsx';
import PreviewPanel from './PreviewPanel.jsx';
import { ProjectPanelRef } from "./ProjectPanelRef.jsx";
import { EntitiesPanelRef } from "./EntitiesPanelRef.jsx";
import { ExtraScreensPanelRef } from "./ExtraScreensPanelRef.jsx";
import { ExternalSdksPanelRef } from "./ExternalSdksPanelRef.jsx";

export default function GenerationForm({ projectForm, extraScreensForm, externalSdksForm, entitiesForm, state, actions, previewContent, onClean, hidden }) {
  return (
    <section id="generation-form" className={`form-column${hidden ? ' hidden' : ''}`}>
      <ProjectPanelRef ref={projectForm} state={state} actions={actions} />
      <BackendSyncPanel state={state} actions={actions} />
      <ImageCachePanel state={state} actions={actions} />
      <EntitiesPanelRef ref={entitiesForm} state={state} actions={actions} />
      <ExtraScreensPanelRef ref={extraScreensForm} state={state} actions={actions} />
      <ExternalSdksPanelRef ref={externalSdksForm} state={state} actions={actions} />
      <SigningPanel state={state} actions={actions} />
      <PreviewPanel previewContent={previewContent} onClean={onClean} />
    </section>
  );
}
