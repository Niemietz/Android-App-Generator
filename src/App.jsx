import { useRef, useState } from 'react';
import TopBar from './components/TopBar';
import ContactForm from './components/ContactForm';
import Sidebar from './components/Sidebar';
import useGeneratorState from './hooks/useGeneratorState';
import GenerationForm from "./components/generation/GenerationForm";

const CONTACT_HASH = '#contact';

export default function App() {
	const projectForm = useRef();
	const entitiesForm = useRef();
	const extraScreenForm = useRef();
	const externalSdksForm = useRef();
	const releaseSigningForm = useRef();
	const {state, actions} = useGeneratorState();
	const [busy, setBusy] = useState(false);
	const [view, setView] = useState(window.location.hash === CONTACT_HASH ? 'contact' : 'generation');
	const [previewContent, setPreviewContent] = useState('');
	const [statusMsg, setStatusMsg] = useState({text: '', kind: ''});

	const toggleContact = () => {
		if (view === 'generation') {
			window.location.hash = CONTACT_HASH;
			setView('contact');
		} else {
			window.location.hash = '';
			setView('generation');
		}
	};

	const handleClean = () => {
		setStatusMsg({text: '', kind: ''});
		setPreviewContent('');
	};

	return (
		<div className="scaffold">
			<TopBar state={state}/>
			<main className="layout">
				<GenerationForm
					busy={busy}
					projectForm={projectForm}
					entitiesForm={entitiesForm}
					extraScreenForm={extraScreenForm}
					externalSdksForm={externalSdksForm}
					releaseSigningForm={releaseSigningForm}
					state={state}
					actions={actions}
					previewContent={previewContent}
					onClean={handleClean}
					hidden={view !== 'generation'}
				/>
				<ContactForm
					hidden={view !== 'contact'}
					busy={busy}
					setBusy={setBusy}
					previewContent={previewContent}
					onClean={handleClean}
				/>
				<Sidebar
					state={state}
					view={view}
					busy={busy}
					setBusy={setBusy}
					projectForm={projectForm}
					entitiesForm={entitiesForm}
					extraScreenForm={extraScreenForm}
					externalSdksForm={externalSdksForm}
					releaseSigningForm={releaseSigningForm}
					onToggleContact={toggleContact}
					onPreviewLoaded={setPreviewContent}
					statusMsg={statusMsg}
					setStatusMsg={setStatusMsg}
				/>
			</main>
		</div>
	);
}
