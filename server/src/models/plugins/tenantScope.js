// tenantScope — Mongoose plugin that enforces per-organisation data isolation.
//
// Attach it to every model that carries an `organisationId` field. While a
// request is running inside an AsyncLocalStorage tenant context (set up by the
// auth `protect` middleware), the plugin:
//   - injects `{ organisationId }` into the filter of every read/update/delete
//     query (find, findOne, findById, countDocuments, update*, delete*,
//     findByIdAndUpdate, etc.), so a tenant can only touch its own documents;
//   - prepends `{ $match: { organisationId } }` to every aggregation pipeline
//     (dashboard stats, reports, per-officer performance);
//   - stamps `organisationId` onto newly created documents, so a caller cannot
//     smuggle another tenant's organisationId in the request body.
//
// Code with NO tenant context (login, registration, the seed script, direct
// mongoose scripts, and background sweeps) is deliberately unaffected: the
// plugin is a no-op for those call sites.
import { currentOrgId, getTenantContext } from "../../utils/tenant.js";

// Query hooks that accept a filter. getFilter() returns the filter object by
// reference, so mutating one key scopes the operation in place — including
// findByIdAndUpdate/DELETE, whose first argument is an _id filter.
const isQueryScopeable = () => {
  const context = getTenantContext();
  return context !== undefined;
};

const scopeFilter = (query) => {
  const filter = query.getFilter();
  // Callers may legitimately pre-scope (e.g. an explicit cross-join); never
  // override an existing organisationId constraint.
  if (!filter || filter.organisationId !== undefined) return;
  const orgId = currentOrgId();
  // An authenticated user with no org assigned sees nothing: organisationId is
  // always stamped on real data, so `null` matches no document.
  filter.organisationId = orgId;
};

// Aggregation pipelines get a leading $match on the tenant boundary. The
// pipeline object is mutable, so prepend without rebuilding.
const scopeAggregate = (agg) => {
  const orgId = currentOrgId();
  const pipeline = agg.pipeline();
  const alreadyScoped = pipeline.some(
    (stage) => stage.$match && stage.$match.organisationId !== undefined,
  );
  if (alreadyScoped) return;
  pipeline.unshift({ $match: { organisationId: orgId } });
};

export default function tenantScope(schema) {
  // Only models that declare an organisationId field are tenant data.
  if (!schema.paths.organisationId) return;

  schema.pre(
    /^count|find|distinct|update|delete/,
    function () {
      if (isQueryScopeable()) scopeFilter(this);
    },
  );

  schema.pre("aggregate", function () {
    if (isQueryScopeable()) scopeAggregate(this);
  });

  schema.pre("save", function (next) {
    if (this.isNew && isQueryScopeable()) {
      this.organisationId = currentOrgId();
    }
    next();
  });
}