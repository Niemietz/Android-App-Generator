import PasswordField from '../PasswordField.jsx';

export default function SigningPanel({ state, actions }) {
  const { signing } = state;
  const setS = actions.setSigningField;

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="tag">06</span>
        <h2>Release Signing</h2>
      </div>
      <div className="field-row">
        <label>
          Store File Name
          <input type="text" value={signing.storeFilename} onChange={(e) => setS('storeFilename', e.target.value)} />
        </label>
        <label>
          Store Password
          <PasswordField
            className="mono"
            value={signing.storePassword}
            onChange={(v) => setS('storePassword', v)}
          />
        </label>
      </div>
      <div className="field-row">
        <label>
          Key Alias
          <input type="text" className="mono" value={signing.keyAlias} onChange={(e) => setS('keyAlias', e.target.value)} />
        </label>
        <label>
          Key Password
          <PasswordField className="mono" value={signing.keyPassword} onChange={(v) => setS('keyPassword', v)} />
        </label>
      </div>
    </div>
  );
}
