import { forwardRef } from 'react';
import SdkCard from "./SdkCard.jsx";

export const ExternalSdksPanelRef =
    forwardRef((props, ref) => {
        return <form ref={ref}>
            <div className="panel">
                <div className="panel-head">
                    <span className="tag">05</span>
                    <h2>External SDKs</h2>
                    <button className="btn-ghost" type="button" onClick={() => props.actions.addSdk()}>
                        + Add SDK
                    </button>
                </div>
                <p className="hint">
                    Each SDK becomes two Gradle modules: a dependency-free <code>&lt;name&gt;</code> contracts module (interfaces
                    only) and a <code>&lt;name&gt;-implementation</code> module depending on it via{' '}
                    <code>api(project(":&lt;name&gt;"))</code>, with generated stub classes bound via Hilt. Use the type{' '}
                    <code>RemoteImage</code> for any parameter/return type that's a cached remote image.
                </p>
                <div id="sdkList">
                    {props.state.externalSdks.map((sdk) => (
                        <SdkCard key={sdk.id} sdk={sdk} actions={props.actions} />
                    ))}
                </div>
            </div>
        </form>
    })
