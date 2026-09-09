// Hubtel merchant account gateway (Ghana mobile money). Two modes:
//
//   LIVE  – HUBTEL_CLIENT_ID / HUBTEL_CLIENT_SECRET / HUBTEL_MERCHANT_ACCOUNT
//           are set, calls https://api.hubtel.com/... with Basic auth.
//   TEST  – creds are absent; every call "succeeds" with a simulated token so
//           the whole recording flow can be exercised and demoed without a
//           merchant account. Payments created this way are flagged with
//           simulated: true so the UI never presents them as real transactions.
//
// Endpoints (Hubtel Merchant Account API):
//   Receive Mobile Money  POST /v1/merchantaccount/merchants/{acct}/receive/mobilemoney
//   Send Mobile Money     POST /v1/merchantaccount/merchants/{acct}/send/mobilemoney
//   Transaction status    GET  /v1/merchantaccount/merchants/{acct}/transactions/status?token=
const BASE_URL = "https://api.hubtel.com/v1/merchantaccount/merchants";

const config = () => ({
  merchantAccount: process.env.HUBTEL_MERCHANT_ACCOUNT || "",
  clientId: process.env.HUBTEL_CLIENT_ID || "",
  clientSecret: process.env.HUBTEL_CLIENT_SECRET || "",
  // When the callback URL points at the dev server it won't be reachable from
  // the internet, so reconciliation falls back to status polling.
  callbackUrl: process.env.HUBTEL_CALLBACK_URL || "",
});

// Hubtel is configured when all three merchant credentials are present.
export const isHubtelConfigured = () => {
  const { merchantAccount, clientId, clientSecret } = config();
  return Boolean(merchantAccount && clientId && clientSecret);
};

// Normalizes a local Ghanaian number (e.g. 0244..., 244..., +233244...) to the
// 23324... international format Hubtel expects. Returns null on invalid input.
export const normalizeMsisdn = (number) => {
  if (!number) return null;
  let n = String(number).replace(/[\s-]/g, "");
  if (n.startsWith("+")) n = n.slice(1);
  if (n.startsWith("0")) n = `233${n.slice(1)}`;
  if (n.startsWith("233") && n.length === 12) return n;
  if (n.length === 9) n = `233${n}`;
  return /^233\d{9}$/.test(n) ? n : null;
};

const authHeader = () => {
  const { clientId, clientSecret } = config();
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
};

const buildUrl = (merchantAccount, path) =>
  `${BASE_URL}/${merchantAccount}/${path}`;

async function apiCall(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(
      json?.Message || json?.message || `Hubtel request failed (${res.status})`,
    );
    err.response = json;
    err.status = res.status;
    throw err;
  }
  return json;
}

// Requests money from a member's mobile money wallet into the coop account.
// Used for dues / contributions / savings. amount is in GHS.
export async function receiveMoney({
  amount,
  msisdn,
  channel = "mtn-gh",
  clientReference,
  description = "",
  customerName = "",
  customerEmail = "",
  callbackUrl = "",
}) {
  const { merchantAccount, callbackUrl: defaultCallback } = config();
  if (!isHubtelConfigured()) {
    return simulate("receive", { amount, msisdn, channel, clientReference });
  }
  const body = {
    Amount: Number(amount),
    CustomerMsisdn: msisdn,
    Channel: channel,
    ClientReference: clientReference,
    Description: description,
    PrimaryCallbackUrl: callbackUrl || defaultCallback,
    SecondaryCallbackURL: callbackUrl || defaultCallback,
    ClientName: customerName || "KonnectCore Member",
    CustomerName: customerName || "Member",
    CustomerEmail: customerEmail || "",
  };
  const json = await apiCall(
    "POST",
    buildUrl(merchantAccount, "receive/mobilemoney"),
    body,
  );
  return {
    token: json?.Data?.Token,
    responseCode: json?.ResponseCode,
    message: json?.Message,
  };
}

// Sends money from the coop account to a member's mobile money wallet. Used
// for produce payments / payouts.
export async function sendMoney({
  amount,
  msisdn,
  clientReference,
  description = "",
}) {
  const { merchantAccount } = config();
  if (!isHubtelConfigured()) {
    return simulate("send", { amount, msisdn, clientReference });
  }
  const body = {
    Amount: Number(amount),
    RecipientMsisdn: msisdn,
    Description: description,
    ClientReference: clientReference,
  };
  const json = await apiCall(
    "POST",
    buildUrl(merchantAccount, "send/mobilemoney"),
    body,
  );
  return {
    token: json?.Data?.Token,
    responseCode: json?.ResponseCode,
    message: json?.Message,
  };
}

// Queries the status of a previously initiated transaction by its token.
export async function checkTransactionStatus(token) {
  const { merchantAccount } = config();
  if (!isHubtelConfigured()) {
    return { token, status: "success" };
  }
  return apiCall(
    "GET",
    `${buildUrl(merchantAccount, "transactions/status")}?token=${encodeURIComponent(token)}`,
  );
}

// Dev/test-only helper. Produces a deterministic-looking token so payments can
// be reconciled and demoed end to end without a live merchant account.
function simulate(direction, { amount, msisdn, clientReference }) {
  const token = `HUB-${direction === "receive" ? "RCV" : "SND"}-${String(Date.now()).slice(-10)}${Math.floor(Math.random() * 10)}`;
  console.log(
    `[hubtel] SIMULATED ${direction} GHS ${amount} -> ${msisdn} ref ${clientReference} (token ${token}). Set HUBTEL_* env vars to go live.`,
  );
  return { token, responseCode: "200", message: "Simulated payment accepted", simulated: true };
}