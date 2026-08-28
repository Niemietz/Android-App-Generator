import EntityCard from './EntityCard';

export default function EntitiesPanel({state, actions}) {
	return (
		<div className="panel">
			<div className="panel-head">
				<span className="tag">03</span>
				<h2>Entities</h2>
				<button className="btn-ghost" type="button" onClick={() => actions.addEntity()}>
					+ Add entity
				</button>
			</div>
			<p className="hint">
				Each entity becomes a Room table, a domain model, a repository, a Retrofit sync channel, and its
				own{' '}
				<code>feature-*</code> Gradle module.
			</p>
			<div id="entityList">
				{state.entities.map((entity, index) => (
					<EntityCard key={entity.id} index={index} entity={entity} actions={actions}/>
				))}
			</div>
		</div>
	);
}
