export default function ImageCachePanel({ state, actions }) {
  const { imageCache, project } = state;
  const setC = actions.setImageCacheField;

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="tag">02b</span>
        <h2>Image cache sync</h2>
      </div>
      <p className="hint">
        Only generated if at least one entity field or SDK method uses the <code>Image</code>/<code>RemoteImage</code>{' '}
        type. Built on OkHttp/Retrofit (and, if chosen, Firebase Storage) only — a URL-keyed local disk cache, checked
        before ever touching the network.
      </p>
      <div className="field-row">
        <label>
          Remote image storage
          <select value={state.imageBackend} onChange={(e) => actions.setImageBackend(e.target.value)}>
            <option value="rest">Your own REST API</option>
            <option value="firebase-storage" disabled={!project.includeFirebase}>
              Firebase Storage (needs Firebase enabled above)
            </option>
          </select>
        </label>
        <label className="checkbox-label">
          <span>&nbsp;</span>
          <span className="checkbox-inline">
            <input
              type="checkbox"
              checked={imageCache.syncEnabled}
              onChange={(e) => setC('syncEnabled', e.target.checked)}
            />{' '}
            Periodically re-sync cached images in background
          </span>
        </label>
      </div>
      <div className="field-row">
        <label>
          Interval (minutes)
          <input
            type="number"
            min={1}
            value={Number.parseInt(imageCache.syncIntervalMinutes)}
            onChange={(e) => setC('syncIntervalMinutes', e.target.valueAsNumber)}
          />
        </label>
        <span />
      </div>
    </div>
  );
}
