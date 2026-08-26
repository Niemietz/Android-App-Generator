import { z } from 'zod';

const _superRefine = (data, ctx, validation, refinedIssue) => {
  const _validation = validation()
  if (!_validation) {
    ctx.addIssue(
      Object.assign(
        {
          code: (refinedIssue.code) ? refinedIssue.code : z.ZodIssueCode.custom,
          minimum: 1,
          inclusive: true,
          path: (refinedIssue.path) ? refinedIssue.path : [ data.path ],
        },
        refinedIssue
      )
    )
  }
}

export const specSchema = z.object({
  project: z.object({
    appName: z.string().min(1),
    packageName: z.string().regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/, 'Invalid package name'),
    minSdk: z.coerce.number().int().positive(),
    targetSdk: z.coerce.number().int().positive(),
    compileSdk: z.coerce.number().int().positive(),
    baseUrl: z.string().regex(/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%.\+~#=]{1,256}\.[a-zA-Z0-9()]{1,63}\b(?:[-a-zA-Z0-9()@:%\+.~#?&\/=])$/, 'Invalid base URL'),
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
          const validationName1 = data.name.length > 0
          const validationName2 = data.name.match(/^[0-9A-Za-z_-]{1,15}$/)
          _superRefine(data, ctx, () => {
            return (validationName1 && validationName2)
          }, {
            origin: "string",
            code:  !validationName1 ? z.ZodIssueCode.too_small : z.ZodIssueCode.invalid_format,
            message:
              !validationName1 ?
                "Too small: expected string to have >=1 characters" :
                "Invalid field name",
          });
        })
      ),
    }).superRefine((data, ctx) => {
      /* Super Refining "name" */
      const validationName1 = data.name.length > 0
      const validationName2 = data.name.match(/^[0-9A-Za-z_-]{1,15}$/)
      _superRefine(data, ctx, () => {
        return (validationName1 && validationName2)
      }, {
        origin: "string",
        code:  !validationName1 ? z.ZodIssueCode.too_small : z.ZodIssueCode.invalid_format,
        message:
          !validationName1 ?
            "Too small: expected string to have >=1 characters" :
            "Invalid entity name",
      });
    })
  ).superRefine((data, ctx) => {
    /* Super Refining "entities" */
    _superRefine(data, ctx, () => {
      return data.length > 0
    }, {
      origin: "array",
      code: z.ZodIssueCode.too_small,
      message: "Add at least one entity",
      path: null, // must be null to show the error in a different way (not below the field)
    });
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
                params: z.array(
                    z.object({
                      name: z.any().optional(),
                      type: z.any().optional(),
                      path: z.any().optional(),
                    }).superRefine((data, ctx) => {
                      /* Super Refining "name" */
                      const validationName1 = data.name.length > 0
                      const validationName2 = data.name.match(/^[0-9A-Za-z_-]{1,15}$/)
                      _superRefine(data, ctx, () => {
                        return (validationName1 && validationName2)
                      }, {
                        origin: "string",
                        code:  !validationName1 ? z.ZodIssueCode.too_small : z.ZodIssueCode.invalid_format,
                        message:
                          !validationName1 ?
                            "Too small: expected string to have >=1 characters" :
                            "Invalid parameter name",
                        path: [ data.path["name"] ],
                      });

                      /* Super Refining "type" */
                      const validationType1 = data.type.length > 0
                      const validationType2 = data.type.match(/^[0-9A-Za-z_-]{1,15}$/)
                      _superRefine(data, ctx, () => {
                        return (validationType1 && validationType2)
                      }, {
                        origin: "string",
                        code:  !validationType1 ? z.ZodIssueCode.too_small : z.ZodIssueCode.invalid_format,
                        message:
                          !validationType1 ?
                            "Too small: expected string to have >=1 characters" :
                            "Invalid parameter type",
                        path: [ data.path["type"] ],
                      });
                    })
                ),
              }).superRefine((data, ctx) => {
                /* Super Refining "name" */
                const validationName1 = data.name.length > 0
                const validationName2 = data.name.match(/^[0-9A-Za-z_-]{1,15}$/)
                _superRefine(data, ctx, () => {
                  return (validationName1 && validationName2)
                }, {
                  origin: "string",
                  code: !validationName1 ? z.ZodIssueCode.too_small : z.ZodIssueCode.invalid_format,
                  message:
                    !validationName1 ?
                      "Too small: expected string to have >=1 characters" :
                      "Invalid method name",
                  path: [ data.path["name"] ],
                });

                /* Super Refining "returnType" */
                const validationReturnType1 = data.returnType.length > 0
                const validationReturnType2 = data.returnType.match(/^[0-9A-Za-z_-]{1,15}$/)
                _superRefine(data, ctx, () => {
                  return (validationReturnType1 && validationReturnType2)
                }, {
                  origin: "string",
                  code: !validationReturnType1 ? z.ZodIssueCode.too_small : z.ZodIssueCode.invalid_format,
                  message:
                    !validationReturnType1 ?
                      "Too small: expected string to have >=1 characters" :
                      "Invalid method return type",
                  path: [ data.path["returnType"] ],
                });
              })
          ),
        }).superRefine((data, ctx) => {
          /* Super Refining "name" */
          const validationName1 = data.name.length > 0
          const validationName2 = data.name.match(/^[0-9A-Za-z_-]{1,15}$/)
          _superRefine(data, ctx, () => {
            return (validationName1 && validationName2)
          }, {
            origin: "string",
            code:  !validationName1 ? z.ZodIssueCode.too_small : z.ZodIssueCode.invalid_format,
            message:
              !validationName1 ?
                "Too small: expected string to have >=1 characters" :
                "Invalid interface name",
          });
        })
      ),
    }).superRefine((data, ctx) => {
      /* Super Refining "name" */
      const validationName1 = data.name.length > 0
      const validationName2 = data.name.match(/^[0-9A-Za-z_-]{1,15}$/)
      _superRefine(data, ctx, () => {
        return (validationName1 && validationName2)
      }, {
        origin: "string",
        code: !validationName1 ? z.ZodIssueCode.too_small : z.ZodIssueCode.invalid_format,
        message:
          !validationName1 ?
            "Too small: expected string to have >=1 characters" :
            "Invalid SDK name",
      });
    })
  )
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
      appName: state.project.appName.trim() || 'MyApp',
      packageName: state.project.packageName.trim() || 'com.example.myapp',
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
      baseUrl: state.project.baseUrl.trim() || 'https://api.example.com/',
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
      name: e.name.trim() || 'Entity',
      fields: e.fields
        .map((f) => ({ name: f.name.trim(), type: f.type, nullable: f.nullable }))
        .filter((f) => f.name.length > 0),
      screens: { ...e.screens },
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
                  .map((p) => ({ name: p.name.trim(), type: p.type.trim() }))
                  .filter((p) => p.name.length > 0),
              }))
              .filter((m) => m.name.length > 0),
          }))
          .filter((i) => i.name.length > 0),
      }))
      .filter((sdk) => sdk.name.length > 0),
    signing: {
      storeFilename: `${state.signing.storeFilename.trim()}.keystore` || 'release.keystore',
      storePassword: state.signing.storePassword.trim() || '123456',
      keyAlias: state.signing.keyAlias.trim() || 'test',
      keyPassword: state.signing.keyPassword.trim() || '123456',
    },
    googleSecrets: { apiKey: state.googleMapsApiKey.trim() || 'abcdefg' },
    azureSecrets: { apiKey: state.azureMapsApiKey.trim() || 'abcdefg' },
  };
}
