"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 5050);
const HOST = "0.0.0.0";
const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const DATA_DIR = path.join(ROOT_DIR, "data");
const STATE_FILE = path.join(DATA_DIR, "sandbox-state.json");
const TOKEN_TTL_MS = 60 * 60 * 1000;
const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_TRANSACTIONS = 120;
const MAX_REQUESTS = 160;
const MAX_ACTIVITY = 180;
const MAX_OTP_MAILBOX = 80;
const LOCAL_SCA_THRESHOLD = 10;
const INTERNATIONAL_SCA_THRESHOLD = 20;
const PRIMARY_DEMO_EMAIL = "merchant.alpha@sandbox.skrill.local";
const CHRISTIAN_DEMO_EMAIL = "christian.vivas@sandbox.skrill.local";
const CHRISTIAN_DEMO_PASSWORD = "Christian!2026";

const SUPPORTED_ENDPOINTS = [
  {
    method: "POST",
    path: "/sandbox/oauth2/token",
    summary: "Issue a local OAuth token for a sandbox account."
  },
  {
    method: "GET",
    path: "/sandbox/mobile/v1/accounts",
    summary: "List available sandbox accounts and balances."
  },
  {
    method: "GET",
    path: "/sandbox/mobile/v1/transactions/all-transactions-history",
    summary: "Return mock transaction history for one account."
  },
  {
    method: "GET",
    path: "/sandbox/mobile/me/send-money/preview",
    summary: "Preview a send-money request with calculated mock fees."
  },
  {
    method: "POST",
    path: "/sandbox/mobile/me/send-money",
    summary: "Create a sandbox send-money transaction."
  },
  {
    method: "POST",
    path: "/sandbox/mobile/api/2fa/v1/sms-challenge",
    summary: "Issue a local OTP challenge for a pending transaction."
  },
  {
    method: "POST",
    path: "/sandbox/mobile/api/2fa/v1/otp-verify",
    summary: "Verify the local OTP challenge."
  },
  {
    method: "POST",
    path: "/sandbox/mobile/me/send-money/{slipId}/finalize",
    summary: "Finalize a verified send-money transaction."
  }
];

const UNSUPPORTED_FEATURES = [
  "Closing sandbox accounts",
  "Monthly statement generation",
  "Shipping preferences",
  "Skrill Shops support"
];

const TRANSFER_FEE_RULES = {
  LOCAL: {
    label: "Local transfer",
    rate: 0.009,
    fixed: 0.29
  },
  INTERNATIONAL: {
    label: "International transfer",
    rate: 0.017,
    fixed: 0.79
  }
};

const TRANSFER_FEE_COMPARISON =
  "Local transfers use a lower fee than international transfers.";

fs.mkdirSync(DATA_DIR, { recursive: true });

let state = loadState();
const sseClients = new Set();

function nowIso() {
  return new Date().toISOString();
}

function randomHex(size) {
  return crypto.randomBytes(size).toString("hex");
}

function randomDigits(length) {
  let value = "";
  while (value.length < length) {
    value += String(crypto.randomInt(0, 10));
  }
  return value.slice(0, length);
}

function roundCurrency(amount) {
  return Math.round((Number(amount) + Number.EPSILON) * 100) / 100;
}

function createId(prefix, length = 10) {
  return `${prefix}${randomHex(Math.ceil(length / 2)).slice(0, length)}`;
}

function cleanState(candidate) {
  const base = candidate && typeof candidate === "object" ? candidate : {};
  let transactions = Array.isArray(base.transactions)
    ? base.transactions.map((transaction) => ({
        ...transaction,
        receipt: transaction.receipt || (transaction.status === "PROCESSED" ? createReceipt(transaction) : null)
      }))
    : [];
  let accounts = Array.isArray(base.accounts)
    ? base.accounts.map((account) => ({
        demoPassword: "Sandbox!2026",
        ...account
      }))
    : [];
  const christianProfile = ensureChristianDemoProfile(accounts, transactions);
  accounts = christianProfile.accounts;
  transactions = christianProfile.transactions;
  return {
    version: 1,
    createdAt: base.createdAt || nowIso(),
    accounts,
    transactions,
    requests: Array.isArray(base.requests) ? base.requests : [],
    activity: Array.isArray(base.activity) ? base.activity : [],
    otpMailbox: Array.isArray(base.otpMailbox) && base.otpMailbox.length
      ? base.otpMailbox
      : deriveOtpMailboxFromTransactions(transactions),
    tokens: Array.isArray(base.tokens) ? base.tokens : []
  };
}

function buildChristianDemoAccount() {
  return seedAccount({
    ownerName: "Christian Vivas",
    email: CHRISTIAN_DEMO_EMAIL,
    type: "MERCHANT",
    balance: 480000,
    demoPassword: CHRISTIAN_DEMO_PASSWORD,
    phone: "+44 7780 450077"
  });
}

function buildChristianDemoTransactions(christianAccount, treasuryAccount, walletAccount) {
  const latestCreatedAt = new Date(Date.now() - (1000 * 60 * 60 * 6)).toISOString();
  const earlierCreatedAt = new Date(Date.now() - (1000 * 60 * 60 * 32)).toISOString();
  return [
    seedTransaction({
      senderAccountId: christianAccount.id,
      recipientEmail: treasuryAccount ? treasuryAccount.email : "treasury.ops@sandbox.skrill.local",
      recipientAccountId: treasuryAccount ? treasuryAccount.id : null,
      amount: 186.4,
      feeAmount: 1.97,
      message: "Merchant reserve review",
      createdAt: latestCreatedAt
    }),
    seedTransaction({
      senderAccountId: christianAccount.id,
      recipientEmail: walletAccount ? walletAccount.email : "wallet.qa@sandbox.skrill.local",
      recipientAccountId: walletAccount ? walletAccount.id : null,
      amount: 92.15,
      feeAmount: 1.12,
      message: "Account balance adjustment",
      createdAt: earlierCreatedAt
    })
  ];
}

function ensureChristianDemoProfile(accounts, transactions) {
  const nextAccounts = Array.isArray(accounts) ? [...accounts] : [];
  const nextTransactions = Array.isArray(transactions) ? [...transactions] : [];
  let christianAccount = nextAccounts.find((account) => account.email === CHRISTIAN_DEMO_EMAIL) || null;

  if (!christianAccount) {
    christianAccount = buildChristianDemoAccount();
    const primaryIndex = nextAccounts.findIndex((account) => account.email === PRIMARY_DEMO_EMAIL);
    if (primaryIndex >= 0) {
      nextAccounts.splice(primaryIndex + 1, 0, christianAccount);
    } else {
      nextAccounts.unshift(christianAccount);
    }
  }

  if (!nextTransactions.some((transaction) => transaction.senderAccountId === christianAccount.id || transaction.recipientAccountId === christianAccount.id)) {
    const treasuryAccount = nextAccounts.find((account) => account.email === "treasury.ops@sandbox.skrill.local") || null;
    const walletAccount = nextAccounts.find((account) => account.email === "wallet.qa@sandbox.skrill.local") || null;
    nextTransactions.unshift(...buildChristianDemoTransactions(christianAccount, treasuryAccount, walletAccount));
  }

  return {
    accounts: nextAccounts,
    transactions: nextTransactions.slice(0, MAX_TRANSACTIONS)
  };
}

function seedAccount(overrides) {
  const createdAt = nowIso();
  const merchantNumber = randomDigits(7);
  return {
    id: createId("acct_"),
    ownerName: overrides.ownerName,
    email: overrides.email.toLowerCase(),
    type: overrides.type,
    currency: overrides.currency || "EUR",
    countryCode: overrides.countryCode || "GBR",
    balance: roundCurrency(overrides.balance || 0),
    status: "VERIFIED",
    apiBase: "/sandbox/mobile",
    oauthClientId: `psd2_${randomHex(5)}`,
    oauthClientSecret: randomHex(12),
    merchantId: `M${merchantNumber}`,
    apiPassword: `mq_${randomHex(5)}`,
    secretWord: `sw_${randomHex(4)}`,
    demoPassword: overrides.demoPassword || "Sandbox!2026",
    phone: overrides.phone || `+44 7${randomDigits(8)}`,
    createdAt,
    updatedAt: createdAt
  };
}

function seedTransaction(overrides) {
  const createdAt = overrides.createdAt || nowIso();
  const feeAmount = roundCurrency(overrides.feeAmount || 1.82);
  const amount = roundCurrency(overrides.amount || 148.25);
  const transaction = {
    id: createId("slip_"),
    senderAccountId: overrides.senderAccountId,
    recipientEmail: overrides.recipientEmail.toLowerCase(),
    recipientAccountId: overrides.recipientAccountId || null,
    amount,
    feeAmount,
    currency: overrides.currency || "EUR",
    message: overrides.message || "Sandbox rehearsal payout",
    status: overrides.status || "PROCESSED",
    scaRequired: Boolean(overrides.scaRequired),
    createdAt,
    updatedAt: createdAt,
    executedAt: createdAt,
    requestId: createId("req_"),
    flow: overrides.flow || "SEND_MONEY",
    channel: "API",
    challenge: overrides.challenge || null,
    receipt: overrides.receipt || null
  };
  if (!transaction.receipt && transaction.status === "PROCESSED") {
    transaction.receipt = createReceipt(transaction);
  }
  return transaction;
}

function createActivity(kind, message, meta = {}) {
  return {
    id: createId("evt_"),
    kind,
    message,
    meta,
    createdAt: nowIso()
  };
}

function createReceipt(transaction) {
  return {
    id: `RCT-${randomDigits(10)}`,
    issuedAt: nowIso(),
    status: "COMPLETED",
    note: `Sandbox demo receipt for ${transaction.flow.toLowerCase().replaceAll("_", " ")}.`
  };
}

function deriveOtpMailboxFromTransactions(transactions) {
  return transactions
    .filter((transaction) => transaction.challenge && transaction.challenge.otpCode)
    .map((transaction) => ({
      id: createId("otp_"),
      transactionId: transaction.id,
      accountId: transaction.senderAccountId,
      accountEmail: null,
      otpCode: transaction.challenge.otpCode,
      expiresAt: transaction.challenge.expiresAt || transaction.updatedAt || transaction.createdAt,
      eventId: transaction.challenge.eventId || "",
      createdAt: transaction.challenge.verifiedAt || transaction.updatedAt || transaction.createdAt,
      status: transaction.status === "PROCESSED"
        ? "FINALIZED"
        : transaction.status === "OTP_VERIFIED"
          ? "VERIFIED"
          : "GENERATED",
      verifiedAt: transaction.challenge.verifiedAt || null,
      finalizedAt: transaction.executedAt || null
    }))
    .sort((left, right) => Date.parse(right.createdAt || 0) - Date.parse(left.createdAt || 0))
    .slice(0, MAX_OTP_MAILBOX);
}

function createSeedState() {
  const merchant = seedAccount({
    ownerName: "Mercury Merchant Demo",
    email: PRIMARY_DEMO_EMAIL,
    type: "MERCHANT",
    balance: 480000,
    demoPassword: "Sandbox!2026",
    phone: "+44 7780 120044"
  });
  const christian = buildChristianDemoAccount();
  const wallet = seedAccount({
    ownerName: "QA Wallet",
    email: "wallet.qa@sandbox.skrill.local",
    type: "PERSONAL",
    balance: 4200.5,
    demoPassword: "Sandbox!2026",
    phone: "+44 7780 230055"
  });
  const treasury = seedAccount({
    ownerName: "Treasury Ops",
    email: "treasury.ops@sandbox.skrill.local",
    type: "BUSINESS",
    currency: "GBP",
    balance: 50650.25,
    countryCode: "GBR",
    demoPassword: "Sandbox!2026",
    phone: "+44 7780 340066"
  });

  const seededTransactions = [
    ...buildChristianDemoTransactions(christian, treasury, wallet),
    seedTransaction({
      senderAccountId: merchant.id,
      recipientEmail: "vendor.reconcile@sandbox.skrill.local",
      amount: 245.75,
      feeAmount: 3.09,
      message: "Daily vendor sweep"
    }),
    seedTransaction({
      senderAccountId: wallet.id,
      recipientEmail: treasury.email,
      recipientAccountId: treasury.id,
      amount: 54.4,
      feeAmount: 0.99,
      message: "Regression wallet transfer"
    })
  ];

  return {
    version: 1,
    createdAt: nowIso(),
    accounts: [merchant, christian, wallet, treasury],
    transactions: seededTransactions,
    requests: [],
    tokens: [],
    otpMailbox: [],
    activity: [
      createActivity("sandbox.ready", "Local Skrill sandbox initialized.", {
        tone: "good"
      }),
      createActivity("accounts.seeded", "Seeded Gabriele Navisi, Christian Vivas, wallet, and treasury accounts.", {
        tone: "neutral"
      })
    ]
  };
}

function loadState() {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      const seeded = cleanState(createSeedState());
      fs.writeFileSync(STATE_FILE, JSON.stringify(seeded, null, 2));
      return seeded;
    }
    const parsed = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    return cleanState(parsed);
  } catch (error) {
    const fallback = cleanState(createSeedState());
    fs.writeFileSync(STATE_FILE, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

function persistState() {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function pushActivity(kind, message, meta = {}) {
  state.activity.unshift(createActivity(kind, message, meta));
  state.activity = state.activity.slice(0, MAX_ACTIVITY);
}

function computeReservedAmount(accountId) {
  return state.transactions.reduce((sum, transaction) => {
    if (transaction.senderAccountId !== accountId) {
      return sum;
    }
    if (transaction.status === "SCA_CHALLENGE" || transaction.status === "OTP_VERIFIED") {
      return sum + roundCurrency(transaction.amount + transaction.feeAmount);
    }
    return sum;
  }, 0);
}

function getAccount(accountId) {
  return state.accounts.find((account) => account.id === accountId) || null;
}

function getAccountByEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  return state.accounts.find((account) => account.email === normalized) || null;
}

function normalizeFeeScope(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "LOCAL" || normalized === "INTERNATIONAL") {
    return normalized;
  }
  return "";
}

function getTransferFeeRule(scope) {
  return TRANSFER_FEE_RULES[normalizeFeeScope(scope) || "INTERNATIONAL"];
}

function getTransferFeeMessage(scope) {
  return normalizeFeeScope(scope) === "LOCAL"
    ? "Recipient is on the same country profile, so the local transfer fee applies."
    : "Recipient is external or outside the local country profile, so the international transfer fee applies.";
}

function getTransferScaThreshold(scope) {
  return normalizeFeeScope(scope) === "INTERNATIONAL"
    ? INTERNATIONAL_SCA_THRESHOLD
    : LOCAL_SCA_THRESHOLD;
}

function getTransferScaMeta(amount, feeScope, recipientEmail) {
  const scaThreshold = getTransferScaThreshold(feeScope);
  const normalizedRecipient = String(recipientEmail || "").trim().toLowerCase();
  return {
    scaThreshold,
    scaRequired: Number(amount) >= scaThreshold || normalizedRecipient.endsWith("@review.test")
  };
}

function resolveTransferScope(sender, recipient) {
  if (
    sender &&
    recipient &&
    sender.countryCode &&
    recipient.countryCode &&
    sender.countryCode === recipient.countryCode
  ) {
    return "LOCAL";
  }
  return "INTERNATIONAL";
}

function resolveTransferFeeMeta(sender, recipientEmail, overrides = {}) {
  const recipient = getAccountByEmail(recipientEmail);
  const feeScope = normalizeFeeScope(overrides.feeScope)
    || resolveTransferScope(sender, recipient);
  const rule = getTransferFeeRule(feeScope);
  const feeRate = Number.isFinite(Number(overrides.feeRate))
    ? Number(overrides.feeRate)
    : rule.rate;
  const fixedFeeAmount = Number.isFinite(Number(overrides.fixedFeeAmount))
    ? Number(overrides.fixedFeeAmount)
    : rule.fixed;

  return {
    feeScope,
    feeLabel: rule.label,
    feeRate,
    fixedFeeAmount: roundCurrency(fixedFeeAmount),
    feeMessage: overrides.feeMessage || getTransferFeeMessage(feeScope),
    feeComparison: overrides.feeComparison || TRANSFER_FEE_COMPARISON,
    senderCountryCode: overrides.senderCountryCode || (sender ? sender.countryCode : null),
    recipientCountryCode: overrides.recipientCountryCode || (recipient ? recipient.countryCode : null)
  };
}

function serializeAccount(account) {
  const reserved = roundCurrency(computeReservedAmount(account.id));
  const available = roundCurrency(account.balance - reserved);
  return {
    ...account,
    available,
    reserved
  };
}

function serializeTransaction(transaction) {
  const sender = getAccount(transaction.senderAccountId);
  const recipient = transaction.recipientAccountId
    ? getAccount(transaction.recipientAccountId)
    : getAccountByEmail(transaction.recipientEmail);
  const feeMeta = resolveTransferFeeMeta(sender, transaction.recipientEmail, {
    feeScope: transaction.feeScope,
    feeRate: transaction.feeRate,
    fixedFeeAmount: transaction.fixedFeeAmount,
    feeMessage: transaction.feeMessage,
    feeComparison: transaction.feeComparison,
    senderCountryCode: transaction.senderCountryCode,
    recipientCountryCode: transaction.recipientCountryCode
  });
  return {
    ...transaction,
    totalDebit: roundCurrency(transaction.amount + transaction.feeAmount),
    scaThreshold: getTransferScaThreshold(feeMeta.feeScope),
    senderName: sender ? sender.ownerName : "Unknown sender",
    senderEmail: sender ? sender.email : "unknown@sandbox",
    recipientName: recipient ? recipient.ownerName : "External recipient",
    feeScope: feeMeta.feeScope,
    feeLabel: feeMeta.feeLabel,
    feeRate: feeMeta.feeRate,
    fixedFeeAmount: feeMeta.fixedFeeAmount,
    feeMessage: feeMeta.feeMessage,
    feeComparison: feeMeta.feeComparison,
    senderCountryCode: feeMeta.senderCountryCode,
    recipientCountryCode: feeMeta.recipientCountryCode
  };
}

function serializeOtpMailboxEntry(entry) {
  const account = entry.accountId ? getAccount(entry.accountId) : null;
  return {
    ...entry,
    accountName: account ? account.ownerName : "Unknown account",
    accountEmail: entry.accountEmail || (account ? account.email : null)
  };
}

function trimRequests() {
  state.requests = state.requests.slice(0, MAX_REQUESTS);
}

function trimTransactions() {
  state.transactions = state.transactions.slice(0, MAX_TRANSACTIONS);
}

function buildSummary() {
  const totalBalance = state.accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);
  const openSca = state.transactions.filter((transaction) => {
    return transaction.status === "SCA_CHALLENGE" || transaction.status === "OTP_VERIFIED";
  }).length;
  return {
    accountCount: state.accounts.length,
    transactionCount: state.transactions.length,
    requestCount: state.requests.length,
    openScaCount: openSca,
    totalBalance: roundCurrency(totalBalance),
    supportedEndpointCount: SUPPORTED_ENDPOINTS.length
  };
}

function getLatestPendingChallenge(accountId) {
  return state.transactions.find((transaction) => {
    if (accountId && transaction.senderAccountId !== accountId) {
      return false;
    }
    return transaction.status === "SCA_CHALLENGE" || transaction.status === "OTP_VERIFIED";
  }) || null;
}

function buildSnapshot() {
  const latestChallenge = getLatestPendingChallenge(null);
  return {
    generatedAt: nowIso(),
    summary: buildSummary(),
    accounts: state.accounts.map(serializeAccount),
    transactions: state.transactions.map(serializeTransaction),
    requests: state.requests,
    activity: state.activity,
    otpMailbox: state.otpMailbox.map(serializeOtpMailboxEntry),
    endpoints: SUPPORTED_ENDPOINTS,
    unsupportedFeatures: UNSUPPORTED_FEATURES,
    latestChallenge: latestChallenge ? serializeTransaction(latestChallenge) : null
  };
}

function broadcastSnapshot() {
  const payload = JSON.stringify({
    type: "snapshot",
    snapshot: buildSnapshot()
  });
  for (const client of sseClients) {
    client.write(`data: ${payload}\n\n`);
  }
}

function sendJson(res, statusCode, body) {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "Cache-Control": "no-store"
  });
  res.end(payload);
}

function parseFormBody(rawBody) {
  const params = new URLSearchParams(rawBody);
  const body = {};
  for (const [key, value] of params.entries()) {
    body[key] = value;
  }
  return body;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
      const size = chunks.reduce((sum, item) => sum + item.length, 0);
      if (size > 1024 * 1024) {
        reject(httpError(413, "Payload too large."));
      }
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function readPayload(req) {
  if (req.method === "GET" || req.method === "HEAD") {
    return {};
  }
  const rawBody = await readBody(req);
  if (!rawBody.trim()) {
    return {};
  }
  const contentType = String(req.headers["content-type"] || "").toLowerCase();
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return parseFormBody(rawBody);
  }
  try {
    return JSON.parse(rawBody);
  } catch (error) {
    throw httpError(400, "Request body must be valid JSON or form-encoded data.");
  }
}

function httpError(statusCode, message, extra = {}) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.extra = extra;
  return error;
}

function recordRequest(entry) {
  const request = {
    id: createId("req_"),
    method: entry.method,
    path: entry.path,
    statusCode: entry.statusCode,
    accountId: entry.accountId || null,
    accountEmail: entry.accountEmail || null,
    requestBody: entry.requestBody || null,
    responseBody: entry.responseBody || null,
    createdAt: nowIso()
  };
  state.requests.unshift(request);
  trimRequests();
}

function pushOtpMailboxEntry(entry) {
  state.otpMailbox.unshift({
    id: createId("otp_"),
    createdAt: nowIso(),
    status: "GENERATED",
    ...entry
  });
  state.otpMailbox = state.otpMailbox.slice(0, MAX_OTP_MAILBOX);
}

function updateOtpMailboxEntry(transactionId, otpCode, updates) {
  const target = state.otpMailbox.find((entry) => {
    return entry.transactionId === transactionId
      && (!otpCode || entry.otpCode === otpCode);
  });

  if (target) {
    Object.assign(target, updates);
  }
}

function createToken(accountId) {
  const issuedAt = Date.now();
  const token = {
    token: `sbx_${randomHex(16)}`,
    accountId,
    issuedAt,
    expiresAt: issuedAt + TOKEN_TTL_MS
  };
  state.tokens = state.tokens.filter((item) => item.expiresAt > Date.now());
  state.tokens.unshift(token);
  state.tokens = state.tokens.slice(0, 40);
  return token;
}

function resolveBearerAccount(req) {
  const header = String(req.headers.authorization || "");
  if (!header.startsWith("Bearer ")) {
    return null;
  }
  const tokenValue = header.slice("Bearer ".length).trim();
  const token = state.tokens.find((item) => item.token === tokenValue && item.expiresAt > Date.now());
  if (!token) {
    return null;
  }
  return getAccount(token.accountId);
}

function requireBearerAccount(req) {
  const account = resolveBearerAccount(req);
  if (!account) {
    throw httpError(401, "Missing or invalid bearer token.");
  }
  return account;
}

function feePreview(amount, sender, recipientEmail) {
  const base = roundCurrency(amount);
  const feeMeta = resolveTransferFeeMeta(sender, recipientEmail);
  const percentageFee = roundCurrency(base * feeMeta.feeRate);
  const feeAmount = roundCurrency(percentageFee + feeMeta.fixedFeeAmount);
  return {
    ...feeMeta,
    feeAmount,
    totalDebit: roundCurrency(base + feeAmount)
  };
}

function requirePositiveAmount(amount) {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw httpError(400, "Amount must be a positive number.");
  }
  return roundCurrency(parsed);
}

function requireEmail(email, label = "Email") {
  const trimmed = String(email || "").trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) {
    throw httpError(400, `${label} must be a valid email address.`);
  }
  return trimmed;
}

function requireAccountOwner(ownerName) {
  const value = String(ownerName || "").trim();
  if (value.length < 2) {
    throw httpError(400, "Owner name must be at least 2 characters long.");
  }
  return value;
}

function findTransactionById(id) {
  return state.transactions.find((transaction) => transaction.id === id) || null;
}

function applyTransfer(transaction) {
  if (transaction.executedAt) {
    return;
  }
  const sender = getAccount(transaction.senderAccountId);
  if (!sender) {
    throw httpError(404, "Sender account not found for transaction.");
  }
  const totalDebit = roundCurrency(transaction.amount + transaction.feeAmount);
  sender.balance = roundCurrency(sender.balance - totalDebit);
  sender.updatedAt = nowIso();

  const recipient = getAccountByEmail(transaction.recipientEmail);
  if (recipient && recipient.id !== sender.id) {
    recipient.balance = roundCurrency(recipient.balance + transaction.amount);
    recipient.updatedAt = nowIso();
    transaction.recipientAccountId = recipient.id;
  }

  transaction.executedAt = nowIso();
  if (!transaction.receipt) {
    transaction.receipt = createReceipt(transaction);
  }
}

function latestChallengeForAccount(accountId) {
  return state.transactions.find((transaction) => {
    return transaction.senderAccountId === accountId
      && (transaction.status === "SCA_CHALLENGE" || transaction.status === "OTP_VERIFIED");
  }) || null;
}

function findChallengeTransaction(payload, accountId) {
  const slipId = String(payload.slipId || "").trim();
  const eventId = String(payload.eventId || "").trim();
  const clientEventId = String(payload.clientEventId || "").trim();

  const match = state.transactions.find((transaction) => {
    if (transaction.senderAccountId !== accountId) {
      return false;
    }
    if (!transaction.challenge) {
      return false;
    }
    if (slipId && transaction.id === slipId) {
      return true;
    }
    if (eventId && transaction.challenge.eventId === eventId) {
      return true;
    }
    if (clientEventId && transaction.challenge.clientEventId === clientEventId) {
      return true;
    }
    return false;
  });

  return match || latestChallengeForAccount(accountId);
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      app: "skrill-sandbox-simulator",
      now: nowIso()
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/bootstrap") {
    sendJson(res, 200, buildSnapshot());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/accounts") {
    sendJson(res, 200, {
      accounts: state.accounts.map(serializeAccount)
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/accounts") {
    const payload = await readPayload(req);
    const ownerName = requireAccountOwner(payload.ownerName);
    const email = requireEmail(payload.email);
    const type = ["MERCHANT", "PERSONAL", "BUSINESS"].includes(String(payload.type || "").toUpperCase())
      ? String(payload.type || "").toUpperCase()
      : "MERCHANT";
    const currency = String(payload.currency || "EUR").trim().toUpperCase();
    const balance = requirePositiveAmount(payload.startingBalance || 0);
    const demoPassword = String(payload.demoPassword || "Sandbox!2026").trim();

    if (getAccountByEmail(email)) {
      throw httpError(409, "A sandbox account with that email already exists.");
    }
    if (demoPassword.length < 6) {
      throw httpError(400, "Demo password must be at least 6 characters long.");
    }

    const account = seedAccount({
      ownerName,
      email,
      type,
      currency,
      balance,
      demoPassword
    });

    state.accounts.unshift(account);
    pushActivity("accounts.created", `Provisioned ${type.toLowerCase()} sandbox account for ${ownerName}.`, {
      tone: "good",
      accountId: account.id
    });
    persistState();
    broadcastSnapshot();
    sendJson(res, 201, {
      account: serializeAccount(account)
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/demo-login") {
    const payload = await readPayload(req);
    const email = requireEmail(payload.email);
    const password = String(payload.password || "").trim();
    const account = getAccountByEmail(email);

    if (!account || account.demoPassword !== password) {
      throw httpError(401, "Invalid sandbox email or password.");
    }

    pushActivity("session.login", `Sandbox login opened for ${account.email}.`, {
      tone: "good",
      accountId: account.id
    });
    persistState();
    broadcastSnapshot();
    sendJson(res, 200, {
      ok: true,
      account: serializeAccount(account)
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/transactions") {
    sendJson(res, 200, {
      transactions: state.transactions.map(serializeTransaction)
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    });
    res.write(`data: ${JSON.stringify({ type: "snapshot", snapshot: buildSnapshot() })}\n\n`);
    sseClients.add(res);
    req.on("close", () => {
      sseClients.delete(res);
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/reset") {
    state = cleanState(createSeedState());
    persistState();
    broadcastSnapshot();
    sendJson(res, 200, {
      ok: true,
      resetAt: nowIso()
    });
    return;
  }

  throw httpError(404, "Unknown application endpoint.");
}

async function handleSandbox(req, res, url) {
  if (req.method === "POST" && url.pathname === "/sandbox/oauth2/token") {
    const payload = await readPayload(req);
    const accountId = String(payload.account_id || payload.accountId || "").trim();
    const clientId = String(payload.client_id || payload.clientId || "").trim();
    const clientSecret = String(payload.client_secret || payload.clientSecret || "").trim();

    if (!accountId || !clientId || !clientSecret) {
      throw httpError(400, "Token requests require account_id, client_id, and client_secret.");
    }

    const account = getAccount(accountId);
    if (!account || account.oauthClientId !== clientId || account.oauthClientSecret !== clientSecret) {
      recordRequest({
        method: req.method,
        path: url.pathname,
        statusCode: 401,
        accountId,
        requestBody: { accountId, clientId },
        responseBody: { error: "invalid_client" }
      });
      throw httpError(401, "Invalid sandbox client credentials.");
    }

    const token = createToken(account.id);
    persistState();
    const response = {
      access_token: token.token,
      token_type: "Bearer",
      expires_in: Math.floor(TOKEN_TTL_MS / 1000),
      scope: "aisp pisp sca",
      accountId: account.id
    };
    recordRequest({
      method: req.method,
      path: url.pathname,
      statusCode: 200,
      accountId: account.id,
      accountEmail: account.email,
      requestBody: { accountId, clientId },
      responseBody: response
    });
    pushActivity("oauth.issued", `Issued a sandbox access token for ${account.email}.`, {
      tone: "neutral",
      accountId: account.id
    });
    persistState();
    broadcastSnapshot();
    sendJson(res, 200, response);
    return;
  }

  if (req.method === "GET" && url.pathname === "/sandbox/mobile/v1/accounts") {
    const account = requireBearerAccount(req);
    const response = {
      accounts: state.accounts.map(serializeAccount),
      requestedBy: account.email
    };
    recordRequest({
      method: req.method,
      path: url.pathname,
      statusCode: 200,
      accountId: account.id,
      accountEmail: account.email,
      responseBody: response
    });
    persistState();
    broadcastSnapshot();
    sendJson(res, 200, response);
    return;
  }

  if (req.method === "GET" && url.pathname === "/sandbox/mobile/v1/transactions/all-transactions-history") {
    const account = requireBearerAccount(req);
    const accountId = String(url.searchParams.get("accountId") || account.id);
    if (accountId !== account.id) {
      throw httpError(403, "Sandbox history requests can only target the authenticated account.");
    }
    const response = {
      mobileTransactionHistory: state.transactions
        .filter((transaction) => transaction.senderAccountId === accountId || transaction.recipientAccountId === accountId)
        .map(serializeTransaction)
    };
    recordRequest({
      method: req.method,
      path: `${url.pathname}?accountId=${accountId}`,
      statusCode: 200,
      accountId: account.id,
      accountEmail: account.email,
      responseBody: response
    });
    persistState();
    broadcastSnapshot();
    sendJson(res, 200, response);
    return;
  }

  if (req.method === "GET" && url.pathname === "/sandbox/mobile/me/send-money/preview") {
    const account = requireBearerAccount(req);
    const senderAccountId = String(url.searchParams.get("senderAccountId") || account.id);
    const recipientEmail = requireEmail(url.searchParams.get("recipientEmail"), "Recipient email");
    const amount = requirePositiveAmount(url.searchParams.get("amount"));
    const currency = String(url.searchParams.get("currency") || account.currency).toUpperCase();

    if (senderAccountId !== account.id) {
      throw httpError(403, "Sandbox preview requests can only use the authenticated account.");
    }

    const sender = getAccount(senderAccountId);
    if (!sender) {
      throw httpError(404, "Sender account not found.");
    }

    const fees = feePreview(amount, sender, recipientEmail);
    const scaMeta = getTransferScaMeta(amount, fees.feeScope, recipientEmail);
    const senderState = serializeAccount(sender);
    const response = {
      accountId: sender.id,
      amount,
      currency,
      recipientEmail,
      scaThreshold: scaMeta.scaThreshold,
      scaRequired: scaMeta.scaRequired,
      feeScope: fees.feeScope,
      feeLabel: fees.feeLabel,
      feeRate: fees.feeRate,
      fixedFeeAmount: fees.fixedFeeAmount,
      feeMessage: fees.feeMessage,
      feeComparison: fees.feeComparison,
      senderCountryCode: fees.senderCountryCode,
      recipientCountryCode: fees.recipientCountryCode,
      feeAmount: fees.feeAmount,
      totalDebit: fees.totalDebit,
      availableBalance: senderState.available,
      canProcess: senderState.available >= fees.totalDebit
    };
    recordRequest({
      method: req.method,
      path: `${url.pathname}?senderAccountId=${senderAccountId}&amount=${amount}&currency=${currency}`,
      statusCode: 200,
      accountId: account.id,
      accountEmail: account.email,
      responseBody: response
    });
    persistState();
    broadcastSnapshot();
    sendJson(res, 200, response);
    return;
  }

  if (req.method === "POST" && url.pathname === "/sandbox/mobile/me/send-money") {
    const account = requireBearerAccount(req);
    const payload = await readPayload(req);
    const senderAccountId = String(payload.senderAccountId || account.id);
    const recipientEmail = requireEmail(payload.recipientEmail, "Recipient email");
    const amount = requirePositiveAmount(payload.amount);
    const currency = String(payload.currency || account.currency).toUpperCase();
    const message = String(payload.message || "Sandbox payment flow").trim().slice(0, 160);

    if (senderAccountId !== account.id) {
      throw httpError(403, "Sandbox transfers can only use the authenticated account.");
    }

    if (recipientEmail === account.email) {
      throw httpError(409, "Sender and recipient must be different sandbox emails.");
    }

    const sender = getAccount(senderAccountId);
    if (!sender) {
      throw httpError(404, "Sender account not found.");
    }

    const fees = feePreview(amount, sender, recipientEmail);
    const scaMeta = getTransferScaMeta(amount, fees.feeScope, recipientEmail);
    const availableBalance = serializeAccount(sender).available;
    if (availableBalance < fees.totalDebit) {
      throw httpError(409, "Insufficient sandbox funds for this mock transfer.");
    }

    const requiresSca = scaMeta.scaRequired;
    const challenge = requiresSca
      ? {
          eventId: createId("evt_"),
          clientEventId: createId("client_"),
          maskedPhone: `${sender.phone.slice(0, 7)}xxxx`,
          expiresAt: new Date(Date.now() + OTP_TTL_MS).toISOString(),
          otpCode: null,
          verifiedAt: null
        }
      : null;

    const transaction = {
      id: createId("slip_"),
      senderAccountId: sender.id,
      recipientEmail,
      recipientAccountId: null,
      amount,
      scaThreshold: scaMeta.scaThreshold,
      feeScope: fees.feeScope,
      feeRate: fees.feeRate,
      fixedFeeAmount: fees.fixedFeeAmount,
      feeMessage: fees.feeMessage,
      feeComparison: fees.feeComparison,
      senderCountryCode: fees.senderCountryCode,
      recipientCountryCode: fees.recipientCountryCode,
      feeAmount: fees.feeAmount,
      currency,
      message,
      status: requiresSca ? "SCA_CHALLENGE" : "PROCESSED",
      scaRequired: requiresSca,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      executedAt: null,
      requestId: createId("req_"),
      flow: "SEND_MONEY",
      channel: "API",
      challenge
    };

    if (!requiresSca) {
      applyTransfer(transaction);
    }

    state.transactions.unshift(transaction);
    trimTransactions();
    pushActivity(
      requiresSca ? "payments.challenge" : "payments.processed",
      requiresSca
        ? `Created SCA challenge for ${sender.email} to ${recipientEmail}.`
        : `Processed mock transfer from ${sender.email} to ${recipientEmail}.`,
      {
        tone: requiresSca ? "warn" : "good",
        transactionId: transaction.id
      }
    );

    const response = {
      id: transaction.id,
      status: transaction.status,
      scaRequired: requiresSca,
      details: serializeTransaction(transaction),
      scaDetails: challenge
        ? {
            eventId: challenge.eventId,
            clientEventId: challenge.clientEventId,
            maskedPhone: challenge.maskedPhone,
            expiresAt: challenge.expiresAt
          }
        : null,
      link: {
        rel: "finalize",
        href: `/sandbox/mobile/me/send-money/${transaction.id}/finalize`
      }
    };

    recordRequest({
      method: req.method,
      path: url.pathname,
      statusCode: 201,
      accountId: account.id,
      accountEmail: account.email,
      requestBody: {
        senderAccountId,
        recipientEmail,
        amount,
        currency
      },
      responseBody: response
    });

    persistState();
    broadcastSnapshot();
    sendJson(res, 201, response);
    return;
  }

  if (req.method === "POST" && url.pathname === "/sandbox/mobile/api/2fa/v1/sms-challenge") {
    const account = requireBearerAccount(req);
    const payload = await readPayload(req);
    const transaction = findChallengeTransaction(payload, account.id);

    if (!transaction || transaction.status !== "SCA_CHALLENGE" || !transaction.challenge) {
      throw httpError(404, "No pending SCA challenge found for this sandbox account.");
    }

    transaction.challenge.otpCode = randomDigits(6);
    transaction.challenge.expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();
    transaction.updatedAt = nowIso();

    const response = {
      eventId: transaction.challenge.eventId,
      clientEventId: transaction.challenge.clientEventId,
      slipId: transaction.id,
      maskedDestination: transaction.challenge.maskedPhone,
      expiresAt: transaction.challenge.expiresAt,
      sandboxOtp: transaction.challenge.otpCode
    };

    pushOtpMailboxEntry({
      transactionId: transaction.id,
      accountId: account.id,
      accountEmail: account.email,
      otpCode: transaction.challenge.otpCode,
      expiresAt: transaction.challenge.expiresAt,
      eventId: transaction.challenge.eventId
    });

    pushActivity("sca.otp_sent", `Issued sandbox OTP for ${transaction.id}.`, {
      tone: "neutral",
      transactionId: transaction.id
    });
    recordRequest({
      method: req.method,
      path: url.pathname,
      statusCode: 200,
      accountId: account.id,
      accountEmail: account.email,
      requestBody: payload,
      responseBody: response
    });
    persistState();
    broadcastSnapshot();
    sendJson(res, 200, response);
    return;
  }

  if (req.method === "POST" && url.pathname === "/sandbox/mobile/api/2fa/v1/otp-verify") {
    const account = requireBearerAccount(req);
    const payload = await readPayload(req);
    const transaction = findChallengeTransaction(payload, account.id);
    const verifyCode = String(payload.verifyCode || payload.code || "").trim();

    if (!transaction || !transaction.challenge || transaction.status !== "SCA_CHALLENGE") {
      throw httpError(404, "No active sandbox OTP challenge found.");
    }
    if (!transaction.challenge.otpCode) {
      throw httpError(409, "Issue an OTP challenge before verifying it.");
    }
    if (Date.parse(transaction.challenge.expiresAt) < Date.now()) {
      throw httpError(410, "The sandbox OTP challenge has expired.");
    }
    if (verifyCode !== transaction.challenge.otpCode) {
      recordRequest({
        method: req.method,
        path: url.pathname,
        statusCode: 401,
        accountId: account.id,
        accountEmail: account.email,
        requestBody: payload,
        responseBody: { success: false, error: "OTP_INVALID" }
      });
      throw httpError(401, "Invalid sandbox OTP code.");
    }

    transaction.status = "OTP_VERIFIED";
    transaction.updatedAt = nowIso();
    transaction.challenge.verifiedAt = nowIso();
    updateOtpMailboxEntry(transaction.id, transaction.challenge.otpCode, {
      status: "VERIFIED",
      verifiedAt: transaction.challenge.verifiedAt
    });

    const response = {
      success: true,
      slipId: transaction.id,
      eventId: transaction.challenge.eventId,
      clientEventId: transaction.challenge.clientEventId,
      next: `/sandbox/mobile/me/send-money/${transaction.id}/finalize`
    };

    pushActivity("sca.verified", `Verified sandbox OTP for ${transaction.id}.`, {
      tone: "good",
      transactionId: transaction.id
    });
    recordRequest({
      method: req.method,
      path: url.pathname,
      statusCode: 200,
      accountId: account.id,
      accountEmail: account.email,
      requestBody: payload,
      responseBody: response
    });
    persistState();
    broadcastSnapshot();
    sendJson(res, 200, response);
    return;
  }

  const finalizeMatch = req.method === "POST"
    ? url.pathname.match(/^\/sandbox\/mobile\/me\/send-money\/([^/]+)\/finalize$/)
    : null;

  if (finalizeMatch) {
    const account = requireBearerAccount(req);
    const payload = await readPayload(req);
    const slipId = finalizeMatch[1];
    const transaction = findTransactionById(slipId);

    if (!transaction || transaction.senderAccountId !== account.id) {
      throw httpError(404, "Sandbox transaction not found.");
    }
    if (!transaction.scaRequired) {
      throw httpError(409, "This sandbox transaction does not require finalization.");
    }
    if (transaction.status !== "OTP_VERIFIED") {
      throw httpError(409, "Verify the OTP challenge before finalizing the transfer.");
    }

    const eventId = String((payload.scaDetails && payload.scaDetails.eventId) || payload.eventId || "").trim();
    if (eventId && transaction.challenge && transaction.challenge.eventId !== eventId) {
      throw httpError(400, "SCA event mismatch for finalize request.");
    }

    transaction.status = "PROCESSED";
    transaction.updatedAt = nowIso();
    applyTransfer(transaction);
    updateOtpMailboxEntry(transaction.id, transaction.challenge ? transaction.challenge.otpCode : "", {
      status: "FINALIZED",
      finalizedAt: transaction.executedAt || transaction.updatedAt
    });

    const response = {
      id: transaction.id,
      status: transaction.status,
      details: serializeTransaction(transaction)
    };

    pushActivity("payments.finalized", `Finalized sandbox transfer ${transaction.id}.`, {
      tone: "good",
      transactionId: transaction.id
    });
    recordRequest({
      method: req.method,
      path: url.pathname,
      statusCode: 200,
      accountId: account.id,
      accountEmail: account.email,
      requestBody: payload,
      responseBody: response
    });
    persistState();
    broadcastSnapshot();
    sendJson(res, 200, response);
    return;
  }

  throw httpError(404, "Unknown sandbox endpoint.");
}

function mimeTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

function serveStatic(req, res, url) {
  const requestedPath = url.pathname === "/" ? "index.html" : url.pathname.replace(/^\/+/, "");
  const publicRoot = path.resolve(PUBLIC_DIR);
  const absolutePath = path.resolve(publicRoot, requestedPath);
  if (!absolutePath.startsWith(publicRoot + path.sep) && absolutePath !== publicRoot) {
    throw httpError(403, "Forbidden path.");
  }
  if (!fs.existsSync(absolutePath) || fs.statSync(absolutePath).isDirectory()) {
    throw httpError(404, "Static asset not found.");
  }

  const fileBuffer = fs.readFileSync(absolutePath);
  res.writeHead(200, {
    "Content-Type": mimeTypeFor(absolutePath),
    "Content-Length": fileBuffer.length
  });
  res.end(fileBuffer);
}

async function route(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }

    if (url.pathname.startsWith("/sandbox/")) {
      await handleSandbox(req, res, url);
      return;
    }

    serveStatic(req, res, url);
  } catch (error) {
    const statusCode = Number(error.statusCode || 500);
    const response = {
      error: error.message || "Unexpected server error."
    };
    if (statusCode >= 500) {
      console.error(error);
    }
    if (!res.headersSent) {
      sendJson(res, statusCode, response);
    } else {
      res.end();
    }
  }
}

const server = http.createServer((req, res) => {
  route(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`Skrill sandbox simulator running on http://localhost:${PORT}`);
});
