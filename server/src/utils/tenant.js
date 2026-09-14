// Tenant context helpers. Every authenticated request runs inside an
// AsyncLocalStorage store that carries the acting user's organisation id.
// The tenantScope schema plugin reads this store to automatically scope every
// query and stamp new documents (see models/plugins/tenantScope.js), so a
// handler never needs to pass its organisation around by hand.
//
// Three states exist, and they matter:
//   - No context            -> public/background work (login, seed, scripts,
//                              the overdue sweep). The plugin does NOT scope.
//   - Context with an org   -> authenticated request; everything is scoped to
//                              that organisation.
//   - Context with null org -> authenticated user not yet assigned to an
//                              organisation (e.g. a self-registered officer
//                              awaiting onboarding). They remain isolated but
//                              see no data: the plugin scopes every query to a
//                              match that cannot occur.
import { AsyncLocalStorage } from "node:async_hooks";

export const tenantContext = new AsyncLocalStorage();

// Runs fn inside a tenant context. `organisationId` may be null (see above).
export const runWithOrg = (organisationId, fn) =>
  tenantContext.run({ organisationId }, fn);

// Undefined when no context is active (background work), otherwise the
// { organisationId } store object.
export const getTenantContext = () => tenantContext.getStore();

// The org id in the current context, or null when outside any request.
export const currentOrgId = () => getTenantContext()?.organisationId ?? null;