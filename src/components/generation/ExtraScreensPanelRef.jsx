import {forwardRef, useState} from 'react';

export const ExtraScreensPanelRef =
    forwardRef((props, ref) => {
        const [value, setValue] = useState('');

        const submit = () => {
            const trimmed = value.trim();
            if (trimmed) {
                props.actions.addExtraScreen(trimmed);
                setValue('');
            }
        };

        return <form ref={ref}>
            <div className="panel">
              <div className="panel-head">
                <span className="tag">04</span>
                <h2>Extra screens</h2>
              </div>
              <p className="hint">
                Optional blank Composable stubs for screens not tied to a single entity (e.g. Settings, About).
              </p>
              <div className="field-row">
                <input
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
                <button className="btn-ghost" type="button" onClick={submit}>
                  + Add
                </button>
              </div>
              <div className="chips">
                {props.state.extraScreens.map((name, idx) => (
                  <span className="chip" key={`${name}-${idx}`}>
                    {name} <button type="button" onClick={() => props.actions.removeExtraScreen(idx)}>✕</button>
                  </span>
                ))}
              </div>
            </div>
        </form>
    })
