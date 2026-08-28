import { useRef, useState } from 'react';

let idCounter = 0;

function nextId(prefix) {
	idCounter += 1;
	return `${prefix}-${idCounter}`;
}

function makeField(name = '', type = 'String', nullable = false) {
	return {id: nextId('field'), name, type, nullable};
}

function makeEntity(name) {
	return {
		id: nextId('entity'),
		name,
		screens: {list: true, detail: true, form: true},
		fields: [makeField('name', 'String'), makeField('customFlag', 'Boolean')],
	};
}

function makeParam(name = '', type = '') {
	return {id: nextId('param'), name, type};
}

function makeMethod(name = '', returnType = '') {
	return {id: nextId('method'), name, returnType, suspend: true, parameters: []};
}

function makeInterface(name = '') {
	return {id: nextId('interface'), name, methods: [makeMethod('doSomething', 'Boolean')]};
}

function makeSdk(name = '') {
	return {id: nextId('sdk'), name, interfaces: [makeInterface('MyContract')]};
}

const initialState = {
	project: {
		appName: 'MyApp',
		packageName: 'com.example.myapp',
		minSdk: 24,
		targetSdk: 34,
		compileSdk: 37,
		includeLogin: false,
		includeFirebase: true,
		includeGoogleMaps: true,
		includeAzureMaps: false,
		includeSqlConnectVariant: false,
		includeFirestore: false,
		includeLottie: true,
		baseUrl: 'https://api.example.com/',
	},
	sync: {
		maxRetries: 3,
		periodicSyncEnabled: false,
		periodicSyncIntervalMinutes: 15,
	},
	imageCache: {
		syncEnabled: true,
		syncIntervalMinutes: 60,
	},
	imageBackend: 'rest',
	entities: [makeEntity('Entity')],
	extraScreens: [],
	externalSdks: [],
	signing: {
		storeFilename: 'release',
		storePassword: '123456',
		keyAlias: 'test',
		keyPassword: '123456',
	},
	googleMapsApiKey: 'abcdefg',
	azureMapsApiKey: 'abcdefg',
};

/** Keeps the same "entity counter never goes back down" default-naming quirk as the original. */
function useEntityCounter() {
	const ref = useRef(1); // seed entity 'Task' already consumed counter #1
	return () => {
		ref.current += 1;
		return ref.current;
	};
}

export default function useGeneratorState() {
	const [state, setState] = useState(initialState);
	const nextEntityNumber = useEntityCounter();

	const setProjectField = (key, value) =>
		setState((s) => ({...s, project: {...s.project, [key]: value}}));

	const setSyncField = (key, value) => setState((s) => ({...s, sync: {...s.sync, [key]: value}}));

	const setImageCacheField = (key, value) =>
		setState((s) => ({...s, imageCache: {...s.imageCache, [key]: value}}));

	const setImageBackend = (value) => setState((s) => ({...s, imageBackend: value}));

	const setSigningField = (key, value) => setState((s) => ({...s, signing: {...s.signing, [key]: value}}));

	const setGoogleMapsApiKey = (value) => setState((s) => ({...s, googleMapsApiKey: value}));
	const setAzureMapsApiKey = (value) => setState((s) => ({...s, azureMapsApiKey: value}));

	/** Firebase toggle disables/forces dependent fields, mirroring syncFirebaseDependents(). */
	const setIncludeFirebase = (checked) =>
		setState((s) => ({
			...s,
			project: {
				...s.project,
				includeFirebase: checked,
				includeSqlConnectVariant: checked ? s.project.includeSqlConnectVariant : false,
				includeFirestore: checked ? s.project.includeFirestore : false
			},
			imageBackend: checked ? s.imageBackend : s.imageBackend === 'firebase-storage' ? 'rest' : s.imageBackend,
		}));

	// --- Entities -----------------------------------------------------------
	const addEntity = (name = '') =>
		setState((s) => ({...s, entities: [...s.entities, makeEntity(name || `Entity${nextEntityNumber()}`)]}));

	const removeEntity = (id) => setState((s) => ({...s, entities: s.entities.filter((e) => e.id !== id)}));

	const updateEntity = (id, patch) =>
		setState((s) => ({...s, entities: s.entities.map((e) => (e.id === id ? {...e, ...patch} : e))}));

	const updateEntityScreens = (id, key, value) =>
		setState((s) => ({
			...s,
			entities: s.entities.map((e) => (e.id === id ? {...e, screens: {...e.screens, [key]: value}} : e)),
		}));

	const addField = (entityId) =>
		setState((s) => ({
			...s,
			entities: s.entities.map((e) => (e.id === entityId ? {...e, fields: [...e.fields, makeField()]} : e)),
		}));

	const removeField = (entityId, fieldId) =>
		setState((s) => ({
			...s,
			entities: s.entities.map((e) =>
				e.id === entityId ? {...e, fields: e.fields.filter((f) => f.id !== fieldId)} : e
			),
		}));

	const updateField = (entityId, fieldId, patch) =>
		setState((s) => ({
			...s,
			entities: s.entities.map((e) =>
				e.id === entityId
					? {...e, fields: e.fields.map((f) => (f.id === fieldId ? {...f, ...patch} : f))}
					: e
			),
		}));

	// --- Extra screens --------------------------------------------------------
	const addExtraScreen = (name) => setState((s) => ({...s, extraScreens: [...s.extraScreens, name]}));
	const removeExtraScreen = (idx) =>
		setState((s) => ({...s, extraScreens: s.extraScreens.filter((_, i) => i !== idx)}));

	// --- External SDKs -------------------------------------------------------
	const addSdk = (name = '') => setState((s) => ({...s, externalSdks: [...s.externalSdks, makeSdk(name)]}));
	const removeSdk = (id) => setState((s) => ({...s, externalSdks: s.externalSdks.filter((sdk) => sdk.id !== id)}));
	const updateSdk = (id, patch) =>
		setState((s) => ({
			...s,
			externalSdks: s.externalSdks.map((sdk) => (sdk.id === id ? {...sdk, ...patch} : sdk))
		}));

	const addInterface = (sdkId) =>
		setState((s) => ({
			...s,
			externalSdks: s.externalSdks.map((sdk) =>
				sdk.id === sdkId ? {...sdk, interfaces: [...sdk.interfaces, makeInterface()]} : sdk
			),
		}));

	const removeInterface = (sdkId, interfaceId) =>
		setState((s) => ({
			...s,
			externalSdks: s.externalSdks.map((sdk) =>
				sdk.id === sdkId ? {...sdk, interfaces: sdk.interfaces.filter((i) => i.id !== interfaceId)} : sdk
			),
		}));

	const updateInterface = (sdkId, interfaceId, patch) =>
		setState((s) => ({
			...s,
			externalSdks: s.externalSdks.map((sdk) =>
				sdk.id === sdkId
					? {...sdk, interfaces: sdk.interfaces.map((i) => (i.id === interfaceId ? {...i, ...patch} : i))}
					: sdk
			),
		}));

	const addMethod = (sdkId, interfaceId) =>
		setState((s) => ({
			...s,
			externalSdks: s.externalSdks.map((sdk) =>
				sdk.id === sdkId
					? {
						...sdk,
						interfaces: sdk.interfaces.map((i) =>
							i.id === interfaceId ? {...i, methods: [...i.methods, makeMethod()]} : i
						),
					}
					: sdk
			),
		}));

	const removeMethod = (sdkId, interfaceId, methodId) =>
		setState((s) => ({
			...s,
			externalSdks: s.externalSdks.map((sdk) =>
				sdk.id === sdkId
					? {
						...sdk,
						interfaces: sdk.interfaces.map((i) =>
							i.id === interfaceId ? {...i, methods: i.methods.filter((m) => m.id !== methodId)} : i
						),
					}
					: sdk
			),
		}));

	const updateMethod = (sdkId, interfaceId, methodId, patch) =>
		setState((s) => ({
			...s,
			externalSdks: s.externalSdks.map((sdk) =>
				sdk.id === sdkId
					? {
						...sdk,
						interfaces: sdk.interfaces.map((i) =>
							i.id === interfaceId
								? {...i, methods: i.methods.map((m) => (m.id === methodId ? {...m, ...patch} : m))}
								: i
						),
					}
					: sdk
			),
		}));

	const addParam = (sdkId, interfaceId, methodId) =>
		setState((s) => ({
			...s,
			externalSdks: s.externalSdks.map((sdk) =>
				sdk.id === sdkId
					? {
						...sdk,
						interfaces: sdk.interfaces.map((i) =>
							i.id === interfaceId
								? {
									...i,
									methods: i.methods.map((m) =>
										m.id === methodId ? {...m, parameters: [...m.parameters, makeParam()]} : m
									),
								}
								: i
						),
					}
					: sdk
			),
		}));

	const removeParam = (sdkId, interfaceId, methodId, paramId) =>
		setState((s) => ({
			...s,
			externalSdks: s.externalSdks.map((sdk) =>
				sdk.id === sdkId
					? {
						...sdk,
						interfaces: sdk.interfaces.map((i) =>
							i.id === interfaceId
								? {
									...i,
									methods: i.methods.map((m) =>
										m.id === methodId
											? {...m, parameters: m.parameters.filter((p) => p.id !== paramId)}
											: m
									),
								}
								: i
						),
					}
					: sdk
			),
		}));

	const updateParam = (sdkId, interfaceId, methodId, paramId, patch) =>
		setState((s) => ({
			...s,
			externalSdks: s.externalSdks.map((sdk) =>
				sdk.id === sdkId
					? {
						...sdk,
						interfaces: sdk.interfaces.map((i) =>
							i.id === interfaceId
								? {
									...i,
									methods: i.methods.map((m) =>
										m.id === methodId
											? {
												...m,
												parameters: m.parameters.map((p) => (p.id === paramId ? {...p, ...patch} : p)),
											}
											: m
									),
								}
								: i
						),
					}
					: sdk
			),
		}));

	return {
		state,
		actions: {
			setProjectField,
			setSyncField,
			setImageCacheField,
			setImageBackend,
			setSigningField,
			setGoogleMapsApiKey,
			setAzureMapsApiKey,
			setIncludeFirebase,
			addEntity,
			removeEntity,
			updateEntity,
			updateEntityScreens,
			addField,
			removeField,
			updateField,
			addExtraScreen,
			removeExtraScreen,
			addSdk,
			removeSdk,
			updateSdk,
			addInterface,
			removeInterface,
			updateInterface,
			addMethod,
			removeMethod,
			updateMethod,
			addParam,
			removeParam,
			updateParam,
		},
	};
}
