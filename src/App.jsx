import {useRef, useState} from 'react';
import TopBar from './components/TopBar.jsx';
import ContactForm from './components/ContactForm.jsx';
import Sidebar from './components/Sidebar.jsx';
import useGeneratorState from './hooks/useGeneratorState.js';
import GenerationForm from "./components/generation/GenerationForm.jsx";

const CONTACT_HASH = '#contact';

export default function App() {
  const projectForm = useRef();
  const entitiesForm = useRef();
  const externalSdksForm = useRef();
  const { state, actions } = useGeneratorState();
  const [view, setView] = useState(window.location.hash === CONTACT_HASH ? 'contact' : 'generation');
  const [previewContent, setPreviewContent] = useState('');
  const [statusMsg, setStatusMsg] = useState({ text: '', kind: '' });

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
    setStatusMsg({ text: '', kind: '' });
    setPreviewContent('');
  };

  return (
    <div className="scaffold">
      <TopBar state={state} />
      <main className="layout">
        <GenerationForm
            projectForm={projectForm}
            entitiesForm={entitiesForm}
            externalSdksForm={externalSdksForm}
            state={state}
            actions={actions}
            previewContent={previewContent}
            onClean={handleClean}
            hidden={view !== 'generation'}
        />
        <ContactForm hidden={view !== 'contact'} />
        <Sidebar
          state={state}
          view={view}
          projectForm={projectForm}
          entitiesForm={entitiesForm}
          externalSdksForm={externalSdksForm}
          onToggleContact={toggleContact}
          onPreviewLoaded={setPreviewContent}
          statusMsg={statusMsg}
          setStatusMsg={setStatusMsg}
        />
      </main>
    </div>
  );
}
