import FieldRow from './FieldRow.jsx';

export default function EntityCard({ entity, index, actions }) {
  const entityFieldName = `entity_${index}`

  return (
    <div className="entity-card">
      <div className="entity-card-head">
        <label className="entity-name mono">
          <input
            name={entityFieldName}
            type="text"
            placeholder="Entity name, e.g. Task"
            value={entity.name}
            onChange={(e) => actions.updateEntity(entity.id, { name: e.target.value })}
          />
        </label>
        <button
          className="btn-icon remove-entity"
          type="button"
          title="Remove entity"
          onClick={() => actions.removeEntity(entity.id)}
        >
          ✕
        </button>
      </div>

      <div className="screen-toggles">
        <label>
          <input
            type="checkbox"
            className="screen-list"
            checked={entity.screens.list}
            onChange={(e) => actions.updateEntityScreens(entity.id, 'list', e.target.checked)}
          />{' '}
          List
        </label>
        <label>
          <input
            type="checkbox"
            className="screen-detail"
            checked={entity.screens.detail}
            onChange={(e) => actions.updateEntityScreens(entity.id, 'detail', e.target.checked)}
          />{' '}
          Detail
        </label>
        <label>
          <input
            type="checkbox"
            className="screen-form"
            checked={entity.screens.form}
            onChange={(e) => actions.updateEntityScreens(entity.id, 'form', e.target.checked)}
          />{' '}
          Form
        </label>
      </div>

      <div className="fields-table">
        <div className="fields-header">
          <span>Field</span>
          <span>Type</span>
          <span>Nullable</span>
          <span />
        </div>
        <div className="fields-rows">
          {entity.fields.map((field, fieldIndex) => (
            <FieldRow
              key={field.id}
              entityIndex={index}
              fieldIndex={fieldIndex}
              field={field}
              onChange={(patch) => actions.updateField(entity.id, field.id, patch)}
              onRemove={() => actions.removeField(entity.id, field.id)}
            />
          ))}
        </div>
        <button className="btn-ghost small add-field" type="button" onClick={() => actions.addField(entity.id)}>
          + Add field
        </button>
      </div>
    </div>
  );
}
