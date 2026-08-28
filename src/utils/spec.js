import { z } from 'zod';
import { _superRefineArray, _superRefineName } from "./formValidation.js";

const DEFAULT_APP_NAME = "MyApp"
const DEFAULT_PACKAGE_NAME = "com.example.myapp"
const DEFAULT_BASE_URL = "https://api.example.com/"
const DEFAULT_ENTITY_NAME = "Entity"
const SIGNING_STORE_FILENAME_EXTENSION = ".keystore"
const DEFAULT_STORE_FILENAME = "release.keystore"
const DEFAULT_STORE_PASSWORD = "123456"
const DEFAULT_KEY_ALIAS = "test"
const DEFAULT_KEY_PASSWORD = "123456"
const DEFAULT_GOOGLE_MAPS_KEY = "abcdefg"
const DEFAULT_AZURE_MAPS_KEY = "abcdefg"

const PASSWORD_REGEX = /^[0-9A-Za-z_*@?$%#&!+.-]*$/
const NAME_REGEX = /^[0-9A-Za-z_-]{1,15}$/
const PACKAGE_NAME_REGEX = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/
const URL_REGEX = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%.\+~#=]{1,256}\.[a-zA-Z0-9()]{1,63}\b(?:[-a-zA-Z0-9()@:%\+.~#?&\/=])$/

export const specSchema = z.object({
	project: z.object({
		appName: z.string().trim().min(1),
		packageName: z.string().trim().regex(PACKAGE_NAME_REGEX, 'Invalid package name'),
		minSdk: z.coerce.number().int().positive(),
		targetSdk: z.coerce.number().int().positive(),
		compileSdk: z.coerce.number().int().positive(),
		baseUrl: z.string().trim().regex(URL_REGEX, 'Invalid base URL'),
		/*googleMapsApiKey: z.string().regex(/^AIza[0-9A-Za-z_-]{35}$/, 'Invalid Google API Key').optional(),
		azureMapsApiKey: z.string().regex(/^[0-9a-fA-F]{32}$/, 'Invalid Azure Key').optional(),*/
	})
	.refine((p) => p.minSdk <= p.targetSdk, {
		message: 'Min SDK version must be equals or lower than Target SDK',
	})
	.refine((p) => p.targetSdk <= p.compileSdk, {
		message: 'Target SDK version must be equals or lower than Compile SDK',
	}),
	entities: z.array(
		z.object({
			name: z.any().optional(),
			path: z.any().optional(),
			fields: z.array(
				z.object({
					path: z.any().optional(),
					name: z.any().optional()
				}).superRefine((data, ctx) => {
					/* Super Refining "name" */
					_superRefineName(data, ctx, "name", "Field name")
				})
			),
		}).superRefine((data, ctx) => {
			/* Super Refining "name" */
			_superRefineName(data, ctx, "name", "Entity name")
		})
	).superRefine((data, ctx) => {
		/* Super Refining "entities" */
		_superRefineArray(data, ctx, "entity")
	}),
	externalSdks: z.array(
		z.object({
			name: z.any().optional(),
			path: z.any().optional(),
			interfaces: z.array(
				z.object({
					name: z.any().optional(),
					path: z.any().optional(),
					methods: z.array(
						z.object({
							name: z.any().optional(),
							returnType: z.any().optional(),
							path: z.any().optional(),
							parameters: z.array(
								z.object({
									name: z.any().optional(),
									type: z.any().optional(),
									path: z.any().optional(),
								}).superRefine((data, ctx) => {
									/* Super Refining "name" */
									_superRefineName(data, ctx, "name", "Parameter name", "name")

									/* Super Refining "type" */
									_superRefineName(data, ctx, "type", "Type", "type")
								})
							),
						}).superRefine((data, ctx) => {
							/* Super Refining "name" */
							_superRefineName(data, ctx, "name", "Method name", "name")

							/* Super Refining "returnType" */
							_superRefineName(data, ctx, "returnType", "Return type", "returnType")
						})
					),
				}).superRefine((data, ctx) => {
					/* Super Refining "name" */
					_superRefineName(data, ctx, "name", "Interface name")
				})
			),
		}).superRefine((data, ctx) => {
			/* Super Refining "name" */
			_superRefineName(data, ctx, "name", "SDK name")
		})
	),
	signing: z.object({
		storeFilename: z.string().trim().min(1).max(15).regex(NAME_REGEX),
		storePassword: z.string().trim().min(1).regex(PASSWORD_REGEX),
		keyAlias: z.string().trim().min(1).max(15).regex(NAME_REGEX),
		keyPassword: z.string().trim().min(1).regex(PASSWORD_REGEX),
	})
});

/** Lightweight client-side preview only — normalizeSpec.js on the server is the source of truth. */
export function previewModuleName(rawName) {
	const cleaned = String(rawName || '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^A-Za-z0-9_-]/g, '');
	return cleaned || 'external-sdk';
}

/** Mirrors the server's usesImages check (entities with an Image field, or SDK methods using
 *  RemoteImage) — used only for the live stats/graph preview. */
export function specUsesImages(state) {
	const entityHasImage = state.entities.some((e) => e.fields.some((f) => f.type === 'Image'));
	const sdkHasImage = state.externalSdks.some((sdk) =>
		sdk.interfaces.some((i) =>
			i.methods.some((m) => m.returnType === 'RemoteImage' || m.parameters.some((p) => p.type === 'RemoteImage'))
		)
	);
	return entityHasImage || sdkHasImage;
}

export function computeStats(state) {
	const screenCount = state.entities.reduce(
		(sum, e) => sum + Object.values(e.screens).filter(Boolean).length,
		state.extraScreens.length + (state.project.includeLogin ? 1 : 0)
	);

	let baseModules = state.project.includeLogin ? 6 : 5; // app + core-common/ui/database/network(+auth)
	if (specUsesImages(state)) baseModules += 1; // core-image
	if (state.project.includeFirebase) baseModules += 1; // core-firebase
	if (state.project.includeFirestore) baseModules += 1; // core-firestore
	if (state.project.includeLottie) baseModules += 1; // core-lottie
	if (state.project.includeGoogleMaps && state.project.includeAzureMaps) baseModules += 3; // core-maps, google-maps, azure-maps
	if (state.project.includeGoogleMaps && !state.project.includeAzureMaps) baseModules += 2; // core-maps, google-maps, azure-maps
	if (!state.project.includeGoogleMaps && state.project.includeAzureMaps) baseModules += 2; // core-maps, google-maps, azure-maps

	return {
		entities: state.entities.length,
		screens: screenCount,
		modules: baseModules + state.entities.length + state.externalSdks.length * 2,
	};
}

/** Builds the exact JSON payload shape the backend API expects, mirroring the original
 *  collectSpec()'s output (numbers coerced, blank fields defaulted, empty rows dropped). */
export function buildSpecPayload(state) {
	return {
		project: {
			appName: state.project.appName.trim() || DEFAULT_APP_NAME,
			packageName: state.project.packageName.trim() || DEFAULT_PACKAGE_NAME,
			minSdk: Number(state.project.minSdk) || 24,
			targetSdk: Number(state.project.targetSdk) || 34,
			compileSdk: Number(state.project.compileSdk) || 34,
			includeLogin: state.project.includeLogin,
			includeFirebase: state.project.includeFirebase,
			includeGoogleMaps: state.project.includeGoogleMaps,
			includeAzureMaps: state.project.includeAzureMaps,
			includeSqlConnectVariant: state.project.includeSqlConnectVariant,
			includeFirestore: state.project.includeFirestore,
			includeLottie: state.project.includeLottie,
			baseUrl: state.project.baseUrl.trim() || DEFAULT_BASE_URL,
			sync: {
				maxRetries: Number(state.sync.maxRetries) || 0,
				periodicSyncEnabled: state.sync.periodicSyncEnabled,
				periodicSyncIntervalMinutes: Number(state.sync.periodicSyncIntervalMinutes) || 15,
			},
			imageCache: {
				syncEnabled: state.imageCache.syncEnabled,
				syncIntervalMinutes: Number(state.imageCache.syncIntervalMinutes) || 60,
			},
			imageBackend: state.imageBackend,
		},
		entities: state.entities.map((e) => ({
			name: e.name.trim() || DEFAULT_ENTITY_NAME,
			fields: e.fields
				.map((f) => ({name: f.name.trim(), type: f.type, nullable: f.nullable}))
				.filter((f) => f.name.length > 0),
			screens: {...e.screens},
		})),
		extraScreens: state.extraScreens.slice(),
		externalSdks: state.externalSdks
			.map((sdk) => ({
				name: sdk.name.trim(),
				interfaces: sdk.interfaces
					.map((iface) => ({
						name: iface.name.trim(),
						methods: iface.methods
							.map((m) => ({
								name: m.name.trim(),
								returnType: m.returnType.trim(),
								suspend: m.suspend,
								parameters: m.parameters
									.map((p) => ({name: p.name.trim(), type: p.type.trim()}))
									.filter((p) => p.name.length > 0),
							}))
							.filter((m) => m.name.length > 0),
					}))
					.filter((i) => i.name.length > 0),
			}))
			.filter((sdk) => sdk.name.length > 0),
		signing: {
			storeFilename: `${state.signing.storeFilename.trim()}`.concat(
				SIGNING_STORE_FILENAME_EXTENSION.charAt(0) === "." ?
					SIGNING_STORE_FILENAME_EXTENSION :
					`.${SIGNING_STORE_FILENAME_EXTENSION}`
			) || DEFAULT_STORE_FILENAME,
			storePassword: state.signing.storePassword.trim() || DEFAULT_STORE_PASSWORD,
			keyAlias: state.signing.keyAlias.trim() || DEFAULT_KEY_ALIAS,
			keyPassword: state.signing.keyPassword.trim() || DEFAULT_KEY_PASSWORD,
		},
		googleSecrets: {apiKey: state.googleMapsApiKey.trim() || DEFAULT_GOOGLE_MAPS_KEY},
		azureSecrets: {apiKey: state.azureMapsApiKey.trim() || DEFAULT_AZURE_MAPS_KEY},
	};
}
