const state = {
  snapshot: null,
  tokens: new Map(),
  activeDemoAccountId: window.localStorage.getItem("sandboxActiveAccountId") || "",
  authMode: "login",
  activeView: "overview",
  selectedReceiptId: "",
  transferPreview: null,
  transferChallengeId: "",
  withdrawalPreview: null,
  labContext: {
    slipId: "",
    eventId: "",
    clientEventId: "",
    otpCode: ""
  }
};

const elements = {
  metricAccounts: document.getElementById("metricAccounts"),
  metricRequests: document.getElementById("metricRequests"),
  metricTransactions: document.getElementById("metricTransactions"),
  metricSca: document.getElementById("metricSca"),
  metricLiquidity: document.getElementById("metricLiquidity"),
  menuToggle: document.getElementById("menuToggle"),
  guestMenuPanel: document.getElementById("guestMenuPanel"),
  guestMenuBackdrop: document.getElementById("guestMenuBackdrop"),
  guestMenuClose: document.getElementById("guestMenuClose"),
  authModal: document.getElementById("sandbox-access"),
  closeAuthModal: document.getElementById("closeAuthModal"),
  authOpeners: Array.from(document.querySelectorAll("[data-open-auth]")),
  authModeButtons: Array.from(document.querySelectorAll("[data-auth-mode]")),
  authPanels: Array.from(document.querySelectorAll("[data-auth-panel]")),
  loginForm: document.getElementById("loginForm"),
  loginEmail: document.getElementById("loginEmail"),
  loginPassword: document.getElementById("loginPassword"),
  loginFeedback: document.getElementById("loginFeedback"),
  accountForm: document.getElementById("accountForm"),
  registerFeedback: document.getElementById("registerFeedback"),
  accountsList: document.getElementById("accountsList"),
  logoutButton: document.getElementById("logoutButton"),
  dashboardSidebar: document.getElementById("dashboardSidebar"),
  dashboardSidebarBackdrop: document.getElementById("dashboardSidebarBackdrop"),
  sidebarCloseButton: document.getElementById("sidebarCloseButton"),
  dashboardNav: Array.from(document.querySelectorAll("[data-dashboard-view]")),
  dashboardShortcuts: Array.from(document.querySelectorAll("[data-dashboard-view-shortcut]")),
  dashboardViews: Array.from(document.querySelectorAll("[data-view-panel]")),
  topbarKicker: document.getElementById("topbarKicker"),
  topbarMeta: document.getElementById("topbarMeta"),
  walletGreeting: document.getElementById("walletGreeting"),
  topbarBalance: document.getElementById("topbarBalance"),
  topbarSnapshotBadge: document.getElementById("topbarSnapshotBadge"),
  topbarSnapshotHint: document.getElementById("topbarSnapshotHint"),
  walletBalance: document.getElementById("walletBalance"),
  walletOwner: document.getElementById("walletOwner"),
  walletTypeChip: document.getElementById("walletTypeChip"),
  walletCurrencyChip: document.getElementById("walletCurrencyChip"),
  walletDetails: document.getElementById("walletDetails"),
  walletRecentActivity: document.getElementById("walletRecentActivity"),
  transferForm: document.getElementById("transferForm"),
  transferRecipient: document.getElementById("transferRecipient"),
  transferAmount: document.getElementById("transferAmount"),
  transferCurrency: document.getElementById("transferCurrency"),
  transferMessage: document.getElementById("transferMessage"),
  previewTransferButton: document.getElementById("previewTransferButton"),
  submitTransferButton: document.getElementById("submitTransferButton"),
  transferFeedback: document.getElementById("transferFeedback"),
  transferStatus: document.getElementById("transferStatus"),
  transferSummary: document.getElementById("transferSummary"),
  transferChallengePanel: document.getElementById("transferChallengePanel"),
  transferChallengeCopy: document.getElementById("transferChallengeCopy"),
  transferOtp: document.getElementById("transferOtp"),
  transferSourceName: document.getElementById("transferSourceName"),
  transferSourceMeta: document.getElementById("transferSourceMeta"),
  transferSourceBalance: document.getElementById("transferSourceBalance"),
  issueTransferOtpButton: document.getElementById("issueTransferOtpButton"),
  completeTransferButton: document.getElementById("completeTransferButton"),
  withdrawalForm: document.getElementById("withdrawalForm"),
  withdrawalMethod: document.getElementById("withdrawalMethod"),
  withdrawalAmount: document.getElementById("withdrawalAmount"),
  withdrawalCurrency: document.getElementById("withdrawalCurrency"),
  withdrawalDestination: document.getElementById("withdrawalDestination"),
  withdrawalDestinationLabel: document.getElementById("withdrawalDestinationLabel"),
  withdrawalReference: document.getElementById("withdrawalReference"),
  previewWithdrawalButton: document.getElementById("previewWithdrawalButton"),
  submitWithdrawalButton: document.getElementById("submitWithdrawalButton"),
  withdrawalFeedback: document.getElementById("withdrawalFeedback"),
  withdrawalStatus: document.getElementById("withdrawalStatus"),
  withdrawalSummary: document.getElementById("withdrawalSummary"),
  withdrawalSourceName: document.getElementById("withdrawalSourceName"),
  withdrawalSourceMeta: document.getElementById("withdrawalSourceMeta"),
  withdrawalSourceBalance: document.getElementById("withdrawalSourceBalance"),
  withdrawalMethodButtons: Array.from(document.querySelectorAll("[data-withdrawal-method]")),
  sessionState: document.getElementById("sessionState"),
  challengeBanner: document.getElementById("challengeBanner"),
  labForm: document.getElementById("labForm"),
  labAccount: document.getElementById("labAccount"),
  labPreset: document.getElementById("labPreset"),
  labAmount: document.getElementById("labAmount"),
  labCurrency: document.getElementById("labCurrency"),
  labRecipient: document.getElementById("labRecipient"),
  labMessage: document.getElementById("labMessage"),
  labOtp: document.getElementById("labOtp"),
  labHint: document.getElementById("labHint"),
  copyCurlButton: document.getElementById("copyCurlButton"),
  curlPreview: document.getElementById("curlPreview"),
  responsePreview: document.getElementById("responsePreview"),
  responseMeta: document.getElementById("responseMeta"),
  otpMailboxList: document.getElementById("otpMailboxList"),
  otpMailboxMeta: document.getElementById("otpMailboxMeta"),
  txSearch: document.getElementById("txSearch"),
  txStatusFilter: document.getElementById("txStatusFilter"),
  txDirectionFilter: document.getElementById("txDirectionFilter"),
  transactionTableBody: document.getElementById("transactionTableBody"),
  transactionEmptyState: document.getElementById("transactionEmptyState"),
  receiptList: document.getElementById("receiptList"),
  receiptPreview: document.getElementById("receiptPreview"),
  receiptMeta: document.getElementById("receiptMeta"),
  requestList: document.getElementById("requestList"),
  activityList: document.getElementById("activityList"),
  unsupportedList: document.getElementById("unsupportedList"),
  originValue: document.getElementById("originValue"),
  headerSession: document.getElementById("headerSession"),
  receiptModal: document.getElementById("receiptModal"),
  receiptModalTitle: document.getElementById("receiptModalTitle"),
  receiptModalBody: document.getElementById("receiptModalBody"),
  closeReceiptModal: document.getElementById("closeReceiptModal"),
  overviewHolderName: document.getElementById("overviewHolderName"),
  overviewWalletEmail: document.getElementById("overviewWalletEmail"),
  overviewWalletBalance: document.getElementById("overviewWalletBalance"),
  overviewWalletMeta: document.getElementById("overviewWalletMeta"),
  walletActionButtons: Array.from(document.querySelectorAll("[data-wallet-action]"))
};

const presetHints = {
  token: "Issue a local bearer token with the sandbox client credentials.",
  accounts: "Use a bearer token to list all sandbox accounts and balances.",
  preview: "Calculate fees and confirm a transfer can be processed safely.",
  send: "Create a transfer. Local transfers from 10 and international transfers from 20 open confirmation.",
  otp: "Issue a local OTP code for the latest pending challenge.",
  verify: "Verify the OTP code against the pending challenge.",
  finalize: "Finalize the verified send-money flow and settle the mock funds.",
  history: "Fetch sandbox transaction history for the selected account."
};

const TRANSFER_FEE_GUIDE = {
  LOCAL: {
    label: "Local transfer",
    rate: 0.009,
    fixed: 0.29,
    hint: "Same-country wallet recipient"
  },
  INTERNATIONAL: {
    label: "International transfer",
    rate: 0.017,
    fixed: 0.79,
    hint: "External or cross-country recipient"
  }
};

const LOCAL_SCA_THRESHOLD = 10;
const INTERNATIONAL_SCA_THRESHOLD = 20;
const WITHDRAWAL_METHODS = {
  crypto: {
    label: "Crypto withdrawal",
    shortLabel: "Crypto",
    destinationLabel: "Wallet address",
    destinationPlaceholder: "Enter crypto wallet address",
    defaultDestination: "bc1q-demo-wallet-3920",
    feeRate: 0.018,
    fixedFee: 4.5,
    settlement: "Usually within 15 to 45 minutes after review.",
    note: "Best for external crypto wallets and treasury off-ramping."
  },
  bank: {
    label: "Bank withdrawal",
    shortLabel: "Bank",
    destinationLabel: "Bank account",
    destinationPlaceholder: "Enter IBAN or bank account number",
    defaultDestination: "GB33BUKB20201555555555",
    feeRate: 0.0125,
    fixedFee: 2.5,
    settlement: "Usually within 1 to 2 business days.",
    note: "Best for higher-value settlements into a bank destination."
  },
  card: {
    label: "Card withdrawal",
    shortLabel: "Card",
    destinationLabel: "Card details",
    destinationPlaceholder: "Enter masked card reference",
    defaultDestination: "**** **** **** 2044",
    feeRate: 0.021,
    fixedFee: 1.75,
    settlement: "Usually within a few hours, depending on issuer review.",
    note: "Good for returning funds to an eligible payment card."
  },
  skrill: {
    label: "Skrill withdrawal",
    shortLabel: "Skrill",
    destinationLabel: "Skrill email",
    destinationPlaceholder: "Enter Skrill-linked email",
    defaultDestination: "wallet.destination@account.skrill.local",
    feeRate: 0.0095,
    fixedFee: 1.25,
    settlement: "Usually within the same day after wallet checks complete.",
    note: "Best for internal wallet-to-wallet settlement."
  }
};

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  setAuthMode("login");
  applyDisplayBranding();
  bootstrap();
});

function bindEvents() {
  elements.menuToggle.addEventListener("click", toggleSidebar);
  elements.sidebarCloseButton.addEventListener("click", closeSidebar);
  elements.dashboardSidebarBackdrop.addEventListener("click", closeSidebar);
  if (elements.guestMenuBackdrop) {
    elements.guestMenuBackdrop.addEventListener("click", closeSidebar);
  }
  if (elements.guestMenuClose) {
    elements.guestMenuClose.addEventListener("click", closeSidebar);
  }
  if (elements.closeAuthModal) {
    elements.closeAuthModal.addEventListener("click", closeAuthModal);
  }
  if (elements.authModal) {
    elements.authModal.addEventListener("click", (event) => {
      if (event.target.hasAttribute("data-close-auth-modal")) {
        closeAuthModal();
      }
    });
  }
  elements.authOpeners.forEach((button) => {
    button.addEventListener("click", () => {
      openAuthModal(button.getAttribute("data-open-auth") || "login");
    });
  });
  elements.authModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setAuthMode(button.getAttribute("data-auth-mode") || "login");
    });
  });
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.accountForm.addEventListener("submit", handleAccountCreate);
  elements.logoutButton.addEventListener("click", handleLogout);
  elements.accountsList.addEventListener("click", handleAccountAction);
  elements.transferForm.addEventListener("submit", handleTransferSubmit);
  elements.previewTransferButton.addEventListener("click", handleTransferPreview);
  elements.issueTransferOtpButton.addEventListener("click", handleTransferOtpIssue);
  elements.completeTransferButton.addEventListener("click", handleTransferComplete);
  elements.labForm.addEventListener("submit", handleLabRun);
  elements.copyCurlButton.addEventListener("click", copyCurlPreview);
  elements.receiptList.addEventListener("click", handleReceiptSelection);
  elements.transactionTableBody.addEventListener("click", handleTransactionAction);
  elements.closeReceiptModal.addEventListener("click", closeReceiptModal);
  elements.receiptModal.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-receipt-modal")) {
      closeReceiptModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeReceiptModal();
      closeSidebar();
      closeAuthModal();
    }
  });

  elements.dashboardNav.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveView(button.getAttribute("data-dashboard-view"));
      closeSidebar();
    });
  });

  elements.dashboardShortcuts.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveView(button.getAttribute("data-dashboard-view-shortcut"));
    });
  });

  elements.walletActionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-wallet-action");
      if (action === "send") {
        setActiveView("transfer");
        elements.transferRecipient.focus();
      } else if (action === "withdrawal") {
        setActiveView("withdrawal");
        elements.withdrawalAmount?.focus();
      } else if (action === "receipt") {
        setActiveView("receipts");
      } else {
        setActiveView("developer");
      }
      closeSidebar();
    });
  });

  [
    elements.labAccount,
    elements.labPreset,
    elements.labAmount,
    elements.labCurrency,
    elements.labRecipient,
    elements.labMessage,
    elements.labOtp
  ].forEach((control) => {
    control.addEventListener("input", handleLabControlChange);
    control.addEventListener("change", handleLabControlChange);
  });

  [elements.txSearch, elements.txStatusFilter, elements.txDirectionFilter].forEach((control) => {
    control.addEventListener("input", renderTransactionsTable);
    control.addEventListener("change", renderTransactionsTable);
  });

  [
    elements.transferRecipient,
    elements.transferAmount,
    elements.transferCurrency,
    elements.transferMessage,
    elements.transferOtp
  ].forEach((control) => {
    control.addEventListener("input", syncTransferToLab);
    control.addEventListener("change", syncTransferToLab);
  });

  if (elements.withdrawalForm) {
    elements.withdrawalForm.addEventListener("submit", handleWithdrawalSubmit);
  }
  if (elements.previewWithdrawalButton) {
    elements.previewWithdrawalButton.addEventListener("click", handleWithdrawalPreview);
  }
  elements.withdrawalMethodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setWithdrawalMethod(button.getAttribute("data-withdrawal-method") || "crypto");
    });
  });
  [
    elements.withdrawalAmount,
    elements.withdrawalCurrency,
    elements.withdrawalDestination,
    elements.withdrawalReference
  ].forEach((control) => {
    if (!control) {
      return;
    }
    control.addEventListener("input", handleWithdrawalFormChange);
    control.addEventListener("change", handleWithdrawalFormChange);
  });
}

async function bootstrap() {
  if (elements.originValue) {
    elements.originValue.textContent = window.location.origin;
  }
  setActiveView(state.activeView);
  syncSidebarState(false);
  await refreshSnapshot();
  if (elements.withdrawalMethod) {
    setWithdrawalMethod(elements.withdrawalMethod.value || "crypto");
  }
  connectStream();
  updateLabHint();
  updateCurlPreview();
}

async function refreshSnapshot() {
  const response = await fetch("/api/bootstrap");
  const snapshot = await response.json();
  applySnapshot(snapshot);
}

function connectStream() {
  const source = new EventSource("/api/events");
  source.onmessage = (event) => {
    const payload = JSON.parse(event.data);
    if (payload.type === "snapshot") {
      applySnapshot(payload.snapshot);
    }
  };
}

function applySnapshot(snapshot) {
  state.snapshot = snapshot;
  syncActiveSession(snapshot.accounts);
  renderSummary(snapshot.summary, snapshot.accounts, snapshot.transactions);
  renderAccountOptions(snapshot.accounts);
  renderAccounts(snapshot.accounts);
  renderWallet(snapshot.accounts, snapshot.transactions);
  renderTransferWorkspace(snapshot.accounts, snapshot.transactions);
  renderWithdrawalWorkspace(snapshot.accounts, snapshot.transactions);
  ensureSelectedReceipt(snapshot.transactions);
  renderTransactionsTable();
  renderReceiptList(snapshot.transactions);
  renderReceiptPreview(snapshot.transactions);
  renderOtpMailbox(snapshot.otpMailbox || []);
  renderEvents(elements.requestList, snapshot.requests, "request");
  renderEvents(elements.activityList, snapshot.activity, "activity");
  renderUnsupported(snapshot.unsupportedFeatures || []);
  syncPendingChallenge(snapshot.latestChallenge);
  updateLabHint();
  updateCurlPreview();
  applyDisplayBranding();
}

function setActiveView(view) {
  state.activeView = view;
  elements.dashboardNav.forEach((button) => {
    button.classList.toggle("is-active", button.getAttribute("data-dashboard-view") === view);
  });
  elements.dashboardViews.forEach((panel) => {
    panel.classList.toggle("is-active", panel.getAttribute("data-view-panel") === view);
  });
  updateTopbarContext();
}

function toggleSidebar() {
  if (!state.activeDemoAccountId) {
    syncGuestMenuState(!document.body.classList.contains("guest-menu-open"));
    return;
  }
  const nextOpen = !document.body.classList.contains("sidebar-open");
  syncSidebarState(nextOpen);
}

function closeSidebar() {
  syncSidebarState(false);
  syncGuestMenuState(false);
}

function syncSidebarState(isOpen) {
  document.body.classList.toggle("sidebar-open", isOpen);
  elements.dashboardSidebar.setAttribute("aria-hidden", String(!isOpen));

  if (isOpen) {
    elements.dashboardSidebarBackdrop.hidden = false;
    syncMenuToggleContext();
    return;
  }

  window.setTimeout(() => {
    if (!document.body.classList.contains("sidebar-open")) {
      elements.dashboardSidebarBackdrop.hidden = true;
    }
  }, 180);
  syncMenuToggleContext();
}

function syncGuestMenuState(isOpen) {
  if (!elements.guestMenuPanel) {
    return;
  }

  document.body.classList.toggle("guest-menu-open", isOpen);
  if (isOpen) {
    elements.guestMenuPanel.hidden = false;
    syncMenuToggleContext();
    return;
  }

  window.setTimeout(() => {
    if (!document.body.classList.contains("guest-menu-open")) {
      elements.guestMenuPanel.hidden = true;
    }
  }, 180);
  syncMenuToggleContext();
}

function syncMenuToggleContext() {
  const isAuthenticated = Boolean(state.activeDemoAccountId);
  const isSidebarOpen = document.body.classList.contains("sidebar-open");
  const isGuestMenuOpen = document.body.classList.contains("guest-menu-open");

  elements.menuToggle.setAttribute("aria-controls", isAuthenticated ? "dashboardSidebar" : "guestMenuPanel");
  elements.menuToggle.setAttribute(
    "aria-label",
    isAuthenticated
      ? isSidebarOpen
        ? "Close wallet dashboard"
        : "Open wallet dashboard"
      : isGuestMenuOpen
        ? "Close homepage menu"
        : "Open homepage menu"
  );
  elements.menuToggle.setAttribute("aria-expanded", String(isAuthenticated ? isSidebarOpen : isGuestMenuOpen));
}

function openAuthModal(mode = "login") {
  if (!elements.authModal) {
    return;
  }

  closeSidebar();
  setAuthMode(mode);
  elements.authModal.hidden = false;
  elements.authModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("auth-modal-open");
  syncAuthViewport();
}

function closeAuthModal() {
  if (!elements.authModal) {
    return;
  }

  document.body.classList.remove("auth-modal-open");
  elements.authModal.setAttribute("aria-hidden", "true");
  window.setTimeout(() => {
    if (!document.body.classList.contains("auth-modal-open")) {
      elements.authModal.hidden = true;
    }
  }, 180);
}

function setAuthMode(mode = "login") {
  state.authMode = mode === "register" ? "register" : "login";
  elements.authPanels.forEach((panel) => {
    const isActive = panel.getAttribute("data-auth-panel") === state.authMode;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
  });
  elements.authModeButtons.forEach((button) => {
    const isActive = button.getAttribute("data-auth-mode") === state.authMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (document.body.classList.contains("auth-modal-open")) {
    syncAuthViewport();
  }
}

function syncAuthViewport() {
  if (!elements.authModal) {
    return;
  }

  const surface = elements.authModal.querySelector(".login-stage__surface");
  const loginCard = elements.authModal.querySelector(".login-card");
  const focusTarget = state.authMode === "register"
    ? document.getElementById("ownerName")
    : elements.loginEmail;
  const isPhoneLayout = window.matchMedia("(max-width: 720px)").matches;

  window.setTimeout(() => {
    if (surface) {
      surface.scrollTo({ top: 0, behavior: isPhoneLayout ? "smooth" : "auto" });
    }
    if (isPhoneLayout && loginCard) {
      loginCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    focusTarget?.focus({ preventScroll: true });
  }, 40);
}

function updateTopbarContext() {
  const account = getActiveAccount();
  const displayName = getDisplayAccountName(account) || "your wallet";
  const walletTransactions = account && state.snapshot ? getWalletTransactions(state.snapshot.transactions, account) : [];
  const latestMovement = walletTransactions[0] || null;

  const copyByView = {
    overview: {
      kicker: "Account overview",
      title: account ? `Welcome back, ${displayName}.` : "Open your account wallet.",
      meta: account
        ? "Review balances, recent movements, and quick actions from your home screen."
        : "Sign in to review your wallet, transfers, and receipts."
    },
    transfer: {
      kicker: "Transfer",
      title: account ? `Move money from ${displayName}.` : "Send money from your account.",
      meta: "Preview fees, confirm the final debit, and complete secure transfers."
    },
    withdrawal: {
      kicker: "Withdrawal",
      title: account ? `Withdraw from ${displayName}.` : "Withdraw from your account.",
      meta: "Choose a payout route, review the withdrawal cost, and stage a payout safely."
    },
    transactions: {
      kicker: "Transactions",
      title: "Account activity",
      meta: "Track completed transfers, pending confirmations, and incoming movements."
    },
    receipts: {
      kicker: "Receipts",
      title: "Payment receipts",
      meta: "Open payment records and inspect the latest completed transfers."
    },
    developer: {
      kicker: "Developer tools",
      title: "Integration workspace",
      meta: "Inspect requests, generate cURL previews, and run local account flows."
    }
  };

  const viewCopy = copyByView[state.activeView] || copyByView.overview;
  elements.topbarKicker.textContent = viewCopy.kicker;
  elements.walletGreeting.textContent = viewCopy.title;
  elements.topbarMeta.textContent = viewCopy.meta;

  if (elements.topbarBalance && elements.topbarSnapshotBadge && elements.topbarSnapshotHint) {
    elements.topbarBalance.textContent = account ? formatMoney(account.available, account.currency) : "EUR 0.00";
    elements.topbarSnapshotBadge.textContent = account
      ? `${formatStatusLabel(account.type)} · ${account.currency}`
      : "No active session";
    elements.topbarSnapshotHint.textContent = account
      ? latestMovement
        ? `Last movement ${formatDate(latestMovement.updatedAt || latestMovement.createdAt)}`
        : "No recent movement yet"
      : "Sign in to view account activity.";
  }
}

function renderSummary(summary, accounts, transactions) {
  const activeAccount = getActiveAccount(accounts);
  if (!activeAccount) {
    elements.metricAccounts.textContent = String(summary.accountCount);
    elements.metricRequests.textContent = String(summary.requestCount);
    elements.metricTransactions.textContent = String(summary.transactionCount);
    elements.metricSca.textContent = String(transactions.filter((transaction) => transaction.receipt).length);
    elements.metricLiquidity.textContent = String(summary.openScaCount);
    return;
  }

  const relevantTransactions = getWalletTransactions(transactions, activeAccount);
  const receiptCount = relevantTransactions.filter((transaction) => transaction.receipt).length;
  const pendingChecks = relevantTransactions.filter((transaction) => {
    return transaction.status === "SCA_CHALLENGE" || transaction.status === "OTP_VERIFIED";
  }).length;

  elements.metricAccounts.textContent = formatMoney(activeAccount.available, activeAccount.currency);
  elements.metricRequests.textContent = formatMoney(activeAccount.reserved, activeAccount.currency);
  elements.metricTransactions.textContent = String(relevantTransactions.length);
  elements.metricSca.textContent = String(receiptCount);
  elements.metricLiquidity.textContent = String(pendingChecks);
}

function renderAccountOptions(accounts) {
  const selectedValue = elements.labAccount.value || state.activeDemoAccountId;
  elements.labAccount.innerHTML = accounts.map((account) => {
    return `<option value="${account.id}">${escapeHtml(account.ownerName)} | ${escapeHtml(account.type)} | ${escapeHtml(account.currency)}</option>`;
  }).join("");

  if (selectedValue && accounts.some((account) => account.id === selectedValue)) {
    elements.labAccount.value = selectedValue;
  }
}

function renderAccounts(accounts) {
  const activeAccount = getActiveAccount(accounts);
  const privacyMessage = activeAccount
    ? "Other account profiles, balances, and credentials are hidden from this shared view."
    : "Account profiles, balances, and credentials stay hidden until a user signs in from the homepage.";

  elements.accountsList.innerHTML = `
    <article class="sidebar-privacy-note">
      <p class="sidebar-privacy-note__title">Private account access</p>
      <p class="sidebar-privacy-note__copy">
        ${escapeHtml(privacyMessage)}
      </p>
      <p class="sidebar-privacy-note__meta">
        Use the homepage login form to open a wallet securely.
      </p>
    </article>
  `;
}

function renderWallet(accounts, transactions) {
  const account = getActiveAccount(accounts);
  if (!account) {
    elements.walletBalance.textContent = "EUR 0.00";
    elements.walletOwner.textContent = "No active sandbox account";
    elements.walletTypeChip.textContent = "SANDBOX";
    elements.walletCurrencyChip.textContent = "EUR";
    renderOverviewWallet(null, []);
    elements.walletDetails.innerHTML = buildEmptyIdentityMarkup();
    elements.walletRecentActivity.innerHTML = buildEmptyActivityMarkup();
    updateTopbarContext();
    return;
  }

  const displayName = getDisplayAccountName(account);
  elements.walletBalance.textContent = formatMoney(account.available, account.currency);
  elements.walletOwner.textContent = `${displayName} | ${account.email}`;
  elements.walletTypeChip.textContent = account.type;
  elements.walletCurrencyChip.textContent = account.currency;
  renderOverviewWallet(account, transactions);

  const relevantTransactions = getWalletTransactions(transactions, account);
  elements.walletDetails.innerHTML = buildWalletIdentityMarkup(account, relevantTransactions);

  if (!relevantTransactions.length) {
    elements.walletRecentActivity.innerHTML = buildEmptyActivityMarkup();
    updateTopbarContext();
    return;
  }

  elements.walletRecentActivity.innerHTML = relevantTransactions
    .slice(0, 4)
    .map((transaction) => buildWalletActivityItem(transaction, account.id))
    .join("");
  updateTopbarContext();
}

function renderOverviewWallet(account, transactions) {
  if (!account) {
    elements.overviewHolderName.textContent = "No active account";
    elements.overviewWalletEmail.textContent = "Sign in to view your wallet.";
    elements.overviewWalletBalance.textContent = "EUR 0.00";
    elements.overviewWalletMeta.innerHTML = `
      <div class="overview-wallet-meta-item">
        <span class="metric-label">Status</span>
        <strong>No local session</strong>
      </div>
    `;
    return;
  }

  const displayName = getDisplayAccountName(account);
  const walletTransactions = getWalletTransactions(transactions, account);
  const lastTransaction = walletTransactions[0] || null;

  elements.overviewHolderName.textContent = displayName;
  elements.overviewWalletEmail.textContent = account.email;
  elements.overviewWalletBalance.textContent = formatMoney(account.available, account.currency);
  elements.overviewWalletMeta.innerHTML = [
    overviewWalletMeta("Account type", account.type),
    overviewWalletMeta("Wallet currency", account.currency),
    overviewWalletMeta("Merchant ID", account.merchantId),
    overviewWalletMeta("Last movement", lastTransaction ? formatDate(lastTransaction.updatedAt || lastTransaction.createdAt) : "No activity yet")
  ].join("");
}

function overviewWalletMeta(label, value) {
  return `
    <div class="overview-wallet-meta-item">
      <span class="metric-label">${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function buildEmptyIdentityMarkup() {
  return `
    <article class="identity-empty-state">
      <div class="identity-avatar identity-avatar--empty">?</div>
      <div class="identity-empty-state__copy">
        <strong>Open your account wallet</strong>
        <p class="section-meta">
          Your holder profile, merchant identifiers, and security status will appear here after
          you sign in.
        </p>
      </div>
    </article>
  `;
}

function buildWalletIdentityMarkup(account, transactions) {
  const displayName = getDisplayAccountName(account);
  const pendingChecks = transactions.filter((transaction) => {
    return transaction.status === "SCA_CHALLENGE" || transaction.status === "OTP_VERIFIED";
  }).length;
  const latestMovement = transactions[0] || null;

  return `
    <article class="identity-hero">
      <div class="identity-profile">
        <div class="identity-avatar">${escapeHtml(getInitials(displayName))}</div>
        <div class="identity-profile__copy">
          <p class="metric-label">Primary holder</p>
          <strong>${escapeHtml(displayName)}</strong>
          <p class="identity-profile__meta">${escapeHtml(account.email)}</p>
        </div>
      </div>
      <div class="identity-badges">
        <span class="status-pill dark">${escapeHtml(account.type)}</span>
        <span class="status-pill dark">${escapeHtml(account.currency)} wallet</span>
      </div>
    </article>
    <div class="identity-grid">
      ${identityMetricCard("Merchant ID", account.merchantId, "Local merchant reference")}
      ${identityMetricCard("Client ID", account.oauthClientId, "Connected application profile")}
      ${identityMetricCard("Reserved funds", formatMoney(account.reserved, account.currency), pendingChecks ? `${pendingChecks} security review pending` : "No funds currently on hold")}
      ${identityMetricCard("Last movement", latestMovement ? formatDate(latestMovement.updatedAt || latestMovement.createdAt) : "No activity yet", latestMovement ? `${formatStatusLabel(latestMovement.status)} · ${formatStatusLabel(getDirectionForAccount(latestMovement, account.id))}` : "Awaiting first transfer")}
    </div>
  `;
}

function identityMetricCard(label, value, hint) {
  return `
    <div class="identity-card">
      <span class="metric-label">${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <span class="identity-card__hint">${escapeHtml(hint)}</span>
    </div>
  `;
}

function buildEmptyActivityMarkup() {
  return `
    <article class="wallet-empty-state">
      <div class="wallet-empty-state__icon">+</div>
      <div class="wallet-empty-state__copy">
        <strong>No wallet movements yet</strong>
        <p class="section-meta">
          Completed transfers and incoming payments will appear here as soon as the account starts
          moving funds.
        </p>
      </div>
    </article>
  `;
}

function buildWalletActivityItem(transaction, accountId) {
  const direction = getDirectionForAccount(transaction, accountId);
  const isOutgoing = direction === "OUTGOING";
  const counterpartyName = isOutgoing ? transaction.recipientName : transaction.senderName;
  const counterpartyEmail = isOutgoing ? transaction.recipientEmail : transaction.senderEmail;
  const amountText = `${isOutgoing ? "-" : "+"}${formatMoney(transaction.amount, transaction.currency)}`;
  const helperText = transaction.message || formatStatusLabel(transaction.flow || "PAYMENT");
  const feeText = Number(transaction.feeAmount || 0) > 0
    ? `Fee ${formatMoney(transaction.feeAmount, transaction.currency)}`
    : "No fee";

  return `
    <article class="wallet-recent-item ${isOutgoing ? "is-outgoing" : "is-incoming"}">
      <div class="wallet-recent-item__marker" aria-hidden="true">${isOutgoing ? "↗" : "↙"}</div>
      <div class="wallet-recent-item__body">
        <div class="wallet-recent-item__head">
          <strong>${escapeHtml(counterpartyName)}</strong>
          <span class="status-pill ${getStatusTone(transaction.status)}">${escapeHtml(formatStatusLabel(transaction.status))}</span>
        </div>
        <p class="wallet-recent-item__meta">
          ${escapeHtml(isOutgoing ? "Sent to" : "Received from")} ${escapeHtml(counterpartyEmail || "wallet contact")}
        </p>
        <p class="wallet-recent-item__sub">
          ${escapeHtml(helperText)} · ${escapeHtml(formatDate(transaction.updatedAt || transaction.createdAt))}
        </p>
      </div>
      <div class="wallet-recent-item__amount ${isOutgoing ? "is-negative" : "is-positive"}">
        <strong>${escapeHtml(amountText)}</strong>
        <span>${escapeHtml(feeText)}</span>
      </div>
    </article>
  `;
}

function getInitials(value) {
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";
}

function formatStatusLabel(value) {
  return String(value || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusTone(status) {
  if (status === "PROCESSED") {
    return "good";
  }

  if (status === "SCA_CHALLENGE" || status === "OTP_VERIFIED") {
    return "warn";
  }

  return "dark";
}

function getOtpMailboxTone(status) {
  if (status === "FINALIZED") {
    return "good";
  }

  if (status === "VERIFIED") {
    return "warn";
  }

  return "dark";
}

function renderTransferWorkspace(accounts, transactions) {
  const account = getActiveAccount(accounts);
  if (account && state.transferPreview && state.transferPreview.accountId && state.transferPreview.accountId !== account.id) {
    state.transferPreview = null;
  }
  const pendingChallenge = account
    ? getPreferredPendingChallenge(account, transactions)
    : null;

  const hasAccount = Boolean(account);
  elements.previewTransferButton.disabled = !hasAccount;
  elements.submitTransferButton.disabled = !hasAccount;
  elements.issueTransferOtpButton.disabled = !hasAccount;
  elements.completeTransferButton.disabled = !hasAccount;

  if (!hasAccount) {
    elements.transferStatus.textContent = "Sign in to an account wallet before sending funds.";
    elements.transferFeedback.textContent = "Transfers become available after you open a local account session.";
    elements.transferSourceName.textContent = "No active account";
    elements.transferSourceMeta.textContent = "Sign in to choose a funding source.";
    elements.transferSourceBalance.textContent = "EUR 0.00";
    elements.transferSummary.innerHTML = `
      <div class="receipt-empty">
        Sign in to preview transfer fees, review debit totals, and send money securely.
      </div>
    `;
    elements.transferChallengeCopy.textContent = "Transfers of 10 or more open a confirmation step here.";
    elements.transferOtp.value = "";
    return;
  }

  const displayName = getDisplayAccountName(account);
  if (elements.transferCurrency.querySelector(`option[value="${account.currency}"]`)) {
    elements.transferCurrency.value = account.currency;
  }

  elements.transferSourceName.textContent = displayName;
  elements.transferSourceMeta.textContent = `${account.email} | ${account.type} account`;
  elements.transferSourceBalance.textContent = formatMoney(account.available, account.currency);
  elements.transferStatus.textContent = `Send funds from ${displayName} with live fee preview and secure confirmation when needed.`;

  const hasOtpMailboxEntry = Boolean(
    pendingChallenge
    && state.snapshot
    && Array.isArray(state.snapshot.otpMailbox)
    && state.snapshot.otpMailbox.some((entry) => entry.transactionId === pendingChallenge.id)
  );

  if (pendingChallenge && pendingChallenge.challenge) {
    elements.transferChallengeCopy.textContent = hasOtpMailboxEntry
      ? "Account Authentication fee require. International Transfers of 20 or more open a confirmation step here."
      : "Transfers of 10 or more open a confirmation step here.";
    state.transferChallengeId = pendingChallenge.id;
    if (pendingChallenge.challenge.otpCode) {
      elements.transferOtp.value = pendingChallenge.challenge.otpCode;
    }
  } else {
    state.transferChallengeId = "";
    elements.transferChallengeCopy.textContent = "Transfers of 10 or more open a confirmation step here.";
  }

  if (!state.transferPreview) {
    const recentOutgoing = transactions.find((transaction) => transaction.senderAccountId === account.id);
    if (!recentOutgoing) {
      elements.transferSummary.innerHTML = `
        ${buildIdleTransferSummaryMarkup(account)}
      `;
      return;
    }

    elements.transferSummary.innerHTML = buildIdleTransferSummaryMarkup(account, recentOutgoing);
    return;
  }

  elements.transferSummary.innerHTML = buildTransferSummaryMarkup(account, state.transferPreview);
}

function setWithdrawalMethod(method, preserveDestination = false) {
  const nextMethod = WITHDRAWAL_METHODS[method] ? method : "crypto";
  const config = WITHDRAWAL_METHODS[nextMethod];
  const currentValue = elements.withdrawalDestination ? elements.withdrawalDestination.value.trim() : "";
  const previousMethod = elements.withdrawalMethod ? elements.withdrawalMethod.value : "";
  const previousConfig = WITHDRAWAL_METHODS[previousMethod] || null;
  const canPreserveDestination = preserveDestination
    && currentValue
    && (!previousConfig || currentValue !== previousConfig.defaultDestination);

  if (elements.withdrawalMethod) {
    elements.withdrawalMethod.value = nextMethod;
  }
  elements.withdrawalMethodButtons.forEach((button) => {
    const isActive = button.getAttribute("data-withdrawal-method") === nextMethod;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (elements.withdrawalDestinationLabel) {
    elements.withdrawalDestinationLabel.textContent = config.destinationLabel;
  }
  if (elements.withdrawalDestination) {
    elements.withdrawalDestination.placeholder = config.destinationPlaceholder;
    elements.withdrawalDestination.value = canPreserveDestination ? currentValue : config.defaultDestination;
  }

  if (state.snapshot) {
    renderWithdrawalWorkspace(state.snapshot.accounts, state.snapshot.transactions);
  }
}

function getWithdrawalMethodConfig(method) {
  return WITHDRAWAL_METHODS[method] || WITHDRAWAL_METHODS.crypto;
}

function buildWithdrawalDraft(account) {
  const method = elements.withdrawalMethod ? elements.withdrawalMethod.value : "crypto";
  const config = getWithdrawalMethodConfig(method);
  const amount = Number(elements.withdrawalAmount ? elements.withdrawalAmount.value : 0);
  const currency = String(elements.withdrawalCurrency ? elements.withdrawalCurrency.value : account.currency || "EUR").toUpperCase();
  const destination = String(elements.withdrawalDestination ? elements.withdrawalDestination.value : "").trim();
  const reference = String(elements.withdrawalReference ? elements.withdrawalReference.value : "").trim() || `${config.shortLabel} payout`;
  const feeAmount = roundAmount((amount * config.feeRate) + config.fixedFee);
  const totalDebit = roundAmount(amount + feeAmount);
  const canProcess = totalDebit <= Number(account.available || 0);

  if (!(amount > 0)) {
    throw new Error("Enter a positive withdrawal amount before continuing.");
  }
  if (!destination) {
    throw new Error(`Enter a ${config.destinationLabel.toLowerCase()} before continuing.`);
  }

  return {
    accountId: account.id,
    method,
    methodLabel: config.label,
    shortLabel: config.shortLabel,
    destinationLabel: config.destinationLabel,
    destination,
    reference,
    amount,
    currency,
    feeAmount,
    totalDebit,
    feeRate: config.feeRate,
    fixedFee: config.fixedFee,
    settlement: config.settlement,
    note: config.note,
    canProcess
  };
}

function renderWithdrawalWorkspace(accounts, transactions) {
  if (!elements.withdrawalSummary) {
    return;
  }

  const account = getActiveAccount(accounts);
  if (account && state.withdrawalPreview && state.withdrawalPreview.accountId !== account.id) {
    state.withdrawalPreview = null;
  }

  const hasAccount = Boolean(account);
  if (elements.previewWithdrawalButton) {
    elements.previewWithdrawalButton.disabled = !hasAccount;
  }
  if (elements.submitWithdrawalButton) {
    elements.submitWithdrawalButton.disabled = !hasAccount;
  }

  if (!hasAccount) {
    elements.withdrawalStatus.textContent = "Sign in to a wallet before staging a withdrawal.";
    elements.withdrawalSourceName.textContent = "No active account";
    elements.withdrawalSourceMeta.textContent = "Sign in to choose a payout source.";
    elements.withdrawalSourceBalance.textContent = "EUR 0.00";
    elements.withdrawalFeedback.textContent = "Withdrawal routes become available after you open a wallet session.";
    elements.withdrawalSummary.innerHTML = `
      <div class="receipt-empty">
        Sign in to compare withdrawal routes, review the payout fee, and stage a withdrawal request.
      </div>
    `;
    return;
  }

  if (elements.withdrawalCurrency.querySelector(`option[value="${account.currency}"]`)) {
    elements.withdrawalCurrency.value = account.currency;
  }

  const config = getWithdrawalMethodConfig(elements.withdrawalMethod.value || "crypto");
  const displayName = getDisplayAccountName(account);
  const recentOutgoing = transactions.find((transaction) => transaction.senderAccountId === account.id);

  elements.withdrawalStatus.textContent = `Review ${config.shortLabel.toLowerCase()} payout details from ${displayName} before confirming a request.`;
  elements.withdrawalSourceName.textContent = displayName;
  elements.withdrawalSourceMeta.textContent = `${account.email} | ${account.type} account`;
  elements.withdrawalSourceBalance.textContent = formatMoney(account.available, account.currency);

  if (!state.withdrawalPreview) {
    elements.withdrawalSummary.innerHTML = buildIdleWithdrawalSummaryMarkup(account, config, recentOutgoing);
    return;
  }

  elements.withdrawalSummary.innerHTML = buildWithdrawalSummaryMarkup(account, state.withdrawalPreview);
}

function buildIdleWithdrawalSummaryMarkup(account, config, recentOutgoing = null) {
  return `
    <article class="transfer-summary-card withdrawal-summary-card">
      <div class="event-header">
        <div>
          <p class="metric-label">Preferred route</p>
          <strong>${escapeHtml(config.label)}</strong>
        </div>
        <span class="status-pill dark">Awaiting preview</span>
      </div>
      <div class="transfer-summary-grid">
        <div class="transfer-summary-row">
          <span class="metric-label">Available balance</span>
          <strong>${escapeHtml(formatMoney(account.available, account.currency))}</strong>
          <span>${escapeHtml(account.currency)} wallet</span>
        </div>
        <div class="transfer-summary-row">
          <span class="metric-label">Estimated charge</span>
          <strong>${escapeHtml(formatFeePercent(config.feeRate))} + ${escapeHtml(formatMoney(config.fixedFee, account.currency))}</strong>
          <span>${escapeHtml(config.destinationLabel)}</span>
        </div>
      </div>
      <div class="withdrawal-summary-note">
        <p class="metric-label">Settlement timing</p>
        <strong>${escapeHtml(config.settlement)}</strong>
        <span>${escapeHtml(config.note)}</span>
      </div>
      ${recentOutgoing ? `
        <div class="transfer-summary-list">
          <div class="wallet-detail-row">
            <span>Latest movement</span>
            <strong>${escapeHtml(formatStatusLabel(recentOutgoing.status))} · ${escapeHtml(formatDate(recentOutgoing.updatedAt || recentOutgoing.createdAt))}</strong>
          </div>
        </div>
      ` : ""}
    </article>
  `;
}

function buildWithdrawalSummaryMarkup(account, preview) {
  const statusLabel = preview.stage === "REQUESTED" ? "Requested" : "Preview";
  const statusTone = preview.stage === "REQUESTED" ? "warn" : "dark";
  const payoutAmount = roundAmount(preview.totalDebit - preview.feeAmount);

  return `
    <article class="transfer-summary-card withdrawal-summary-card">
      <div class="event-header">
        <div>
          <p class="metric-label">Current route</p>
          <strong>${escapeHtml(preview.methodLabel)}</strong>
        </div>
        <span class="status-pill ${statusTone}">${escapeHtml(statusLabel)}</span>
      </div>
      <div class="transfer-summary-grid">
        <div class="transfer-summary-row">
          <span class="metric-label">Destination</span>
          <strong>${escapeHtml(preview.destination)}</strong>
          <span>${escapeHtml(preview.destinationLabel)}</span>
        </div>
        <div class="transfer-summary-row">
          <span class="metric-label">Requested amount</span>
          <strong>${escapeHtml(formatMoney(preview.amount, preview.currency))}</strong>
          <span>${escapeHtml(preview.reference)}</span>
        </div>
        <div class="transfer-summary-row">
          <span class="metric-label">Estimated fee</span>
          <strong>${escapeHtml(formatMoney(preview.feeAmount, preview.currency))}</strong>
          <span>${escapeHtml(formatFeePercent(preview.feeRate))} + ${escapeHtml(formatMoney(preview.fixedFee, preview.currency))}</span>
        </div>
        <div class="transfer-summary-row">
          <span class="metric-label">Total debit</span>
          <strong>${escapeHtml(formatMoney(preview.totalDebit, preview.currency))}</strong>
          <span>${escapeHtml(preview.canProcess ? "Funds available" : "Insufficient balance for this route")}</span>
        </div>
      </div>
      <div class="transfer-summary-list">
        <div class="wallet-detail-row">
          <span>Expected destination amount</span>
          <strong>${escapeHtml(formatMoney(payoutAmount, preview.currency))}</strong>
        </div>
        <div class="wallet-detail-row">
          <span>Available after debit</span>
          <strong>${escapeHtml(formatMoney(Number(account.available || 0) - preview.totalDebit, preview.currency))}</strong>
        </div>
        <div class="wallet-detail-row">
          <span>Settlement timing</span>
          <strong>${escapeHtml(preview.settlement)}</strong>
        </div>
      </div>
      <div class="withdrawal-summary-note">
        <p class="metric-label">Route notes</p>
        <strong>${escapeHtml(preview.note)}</strong>
        <span>${escapeHtml(preview.stage === "REQUESTED" ? "The request is staged locally for review in this wallet." : "Preview the route and confirm when you are ready.")}</span>
      </div>
    </article>
  `;
}

function buildIdleTransferSummaryMarkup(account, recentOutgoing = null) {
  return `
    <article class="transfer-summary-card">
      <div class="event-header">
        <div>
          <p class="metric-label">Ready to send</p>
          <strong>${escapeHtml(getDisplayAccountName(account))}</strong>
        </div>
        <span class="status-pill dark">Awaiting preview</span>
      </div>
      <div class="transfer-summary-grid">
        <div class="transfer-summary-row">
          <span class="metric-label">Spendable balance</span>
          <strong>${escapeHtml(formatMoney(account.available, account.currency))}</strong>
          <span>${escapeHtml(account.currency)} wallet</span>
        </div>
        <div class="transfer-summary-row">
          <span class="metric-label">Reserved funds</span>
          <strong>${escapeHtml(formatMoney(account.reserved, account.currency))}</strong>
          <span>Held for pending checks</span>
        </div>
      </div>
      ${buildTransferFeeGuideMarkup(account.currency)}
      ${recentOutgoing ? `
        <div class="transfer-summary-list">
          <div class="wallet-detail-row">
            <span class="metric-label">Last outgoing transfer</span>
            <strong>${escapeHtml(recentOutgoing.recipientName)} | ${escapeHtml(formatMoney(recentOutgoing.amount, recentOutgoing.currency))}</strong>
          </div>
          <div class="wallet-detail-row">
            <span class="metric-label">Reference</span>
            <strong>${escapeHtml(recentOutgoing.message || recentOutgoing.id)}</strong>
          </div>
        </div>
      ` : `
        <div class="wallet-detail-row">
          <span class="metric-label">Next step</span>
          <strong>Preview this transfer to calculate the final debit before sending.</strong>
        </div>
      `}
    </article>
  `;
}

function buildTransferSummaryMarkup(account, preview) {
  const scaThreshold = getTransferScaThreshold(preview);
  const requiresSca = Boolean(preview.scaRequired) || Number(preview.amount || 0) >= scaThreshold;
  const canProcess = preview.canProcess !== false;
  const statusText = preview.stage || (preview.status ? preview.status.replaceAll("_", " ") : "PREVIEW");
  const displayName = getDisplayAccountName(account);
  const previewCurrency = preview.currency || account.currency;
  const scaCopy = getTransferScaCopy(preview.feeScope, requiresSca);

  return `
    <article class="transfer-summary-card">
      <div class="event-header">
        <div>
          <p class="metric-label">Current transfer</p>
          <strong>${escapeHtml(preview.recipientEmail || preview.recipientName || "Pending recipient")}</strong>
        </div>
        <span class="status-pill ${canProcess ? (requiresSca ? "warn" : "good") : "dark"}">${escapeHtml(statusText)}</span>
      </div>
      <div class="transfer-summary-grid">
        <div class="transfer-summary-row">
          <span class="metric-label">Amount</span>
          <strong>${escapeHtml(formatMoney(preview.amount || 0, previewCurrency))}</strong>
          <span>From ${escapeHtml(displayName)}</span>
        </div>
        <div class="transfer-summary-row">
          <span class="metric-label">Total debit</span>
          <strong>${escapeHtml(formatMoney(preview.totalDebit || preview.amount || 0, previewCurrency))}</strong>
          <span>Fee ${escapeHtml(formatMoney(preview.feeAmount || 0, previewCurrency))}</span>
        </div>
        <div class="transfer-summary-row">
          <span class="metric-label">Available balance</span>
          <strong>${escapeHtml(formatMoney(preview.availableBalance ?? account.available, previewCurrency))}</strong>
          <span>${canProcess ? "Funds available" : "Insufficient funds"}</span>
        </div>
        <div class="transfer-summary-row">
          <span class="metric-label">Local SCA</span>
          <strong>${requiresSca ? "Required" : "Not required"}</strong>
          <span>${escapeHtml(scaCopy)}</span>
        </div>
      </div>
      ${buildTransferFeeGuideMarkup(previewCurrency, preview)}
      <div class="transfer-summary-list">
        <div class="wallet-detail-row">
          <span class="metric-label">Reference</span>
          <strong>${escapeHtml(preview.message || elements.transferMessage.value || "Sandbox payout rehearsal")}</strong>
        </div>
        <div class="wallet-detail-row">
          <span class="metric-label">Slip ID</span>
          <strong>${escapeHtml(preview.slipId || preview.id || (preview.details && preview.details.id) || "Not issued yet")}</strong>
        </div>
      </div>
    </article>
  `;
}

function formatFeePercent(rate) {
  const parsed = Number(rate);
  const percentage = (Number.isFinite(parsed) ? parsed : 0) * 100;
  return `${percentage.toFixed(1).replace(/\.0$/, "")}%`;
}

function roundAmount(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function getTransferScaThreshold(value) {
  if (value && typeof value === "object") {
    const explicitThreshold = Number(value.scaThreshold);
    if (Number.isFinite(explicitThreshold) && explicitThreshold > 0) {
      return explicitThreshold;
    }
  }

  const scope = typeof value === "string" ? value : String(value && value.feeScope ? value.feeScope : "");
  return scope.toUpperCase() === "INTERNATIONAL"
    ? INTERNATIONAL_SCA_THRESHOLD
    : LOCAL_SCA_THRESHOLD;
}

function getTransferScaCopy(scope, requiresSca) {
  const threshold = getTransferScaThreshold(scope);
  if (!requiresSca) {
    return `This transfer can settle immediately at the current amount.`;
  }
  return String(scope || "").toUpperCase() === "INTERNATIONAL"
    ? `International transfers of ${threshold} or more trigger confirmation.`
    : `Transfers of ${threshold} or more trigger confirmation.`;
}

function getClientTransferFeeRule(scope, preview = null) {
  const normalizedScope = String(scope || "").toUpperCase();
  const fallback = TRANSFER_FEE_GUIDE[normalizedScope] || TRANSFER_FEE_GUIDE.INTERNATIONAL;
  if (preview && String(preview.feeScope || "").toUpperCase() === normalizedScope) {
    const previewRate = Number(preview.feeRate);
    const previewFixed = Number(preview.fixedFeeAmount);
    return {
      ...fallback,
      rate: Number.isFinite(previewRate) ? previewRate : fallback.rate,
      fixed: Number.isFinite(previewFixed) ? previewFixed : fallback.fixed
    };
  }
  return fallback;
}

function buildTransferFeeGuideMarkup(currency, preview = null) {
  const activeScope = String(preview && preview.feeScope ? preview.feeScope : "").toUpperCase();
  const localRule = getClientTransferFeeRule("LOCAL", preview);
  const internationalRule = getClientTransferFeeRule("INTERNATIONAL", preview);
  const activeTitle = activeScope === "LOCAL"
    ? "Local pricing applied"
    : activeScope === "INTERNATIONAL"
      ? "International pricing applied"
      : "Fee guide before you confirm";
  const activeTone = activeScope === "LOCAL"
    ? "good"
    : activeScope === "INTERNATIONAL"
      ? "warn"
      : "dark";
  const activeMessage = preview
    ? [preview.feeMessage, preview.feeComparison].map((item) => String(item || "").trim()).filter(Boolean).join(" ")
    : "Local transfers use a lower fee than international transfers. The final fee is applied when you preview the recipient details.";

  return `
    <section class="transfer-fee-panel">
      <div class="transfer-fee-panel__head">
        <div>
          <p class="metric-label">Fee guide</p>
          <strong>${escapeHtml(activeTitle)}</strong>
        </div>
        <span class="status-pill ${activeTone}">${escapeHtml(activeScope || "COMPARE")}</span>
      </div>
      <div class="transfer-fee-rates">
        <div class="transfer-fee-rate ${activeScope === "LOCAL" ? "is-active" : ""}">
          <span class="metric-label">${escapeHtml(localRule.label)}</span>
          <strong>${escapeHtml(formatFeePercent(localRule.rate))} + ${escapeHtml(formatMoney(localRule.fixed, currency))}</strong>
          <span>${escapeHtml(localRule.hint)}</span>
        </div>
        <div class="transfer-fee-rate ${activeScope === "INTERNATIONAL" ? "is-active" : ""}">
          <span class="metric-label">${escapeHtml(internationalRule.label)}</span>
          <strong>${escapeHtml(formatFeePercent(internationalRule.rate))} + ${escapeHtml(formatMoney(internationalRule.fixed, currency))}</strong>
          <span>${escapeHtml(internationalRule.hint)}</span>
        </div>
      </div>
      <p class="transfer-fee-copy">${escapeHtml(activeMessage)}</p>
    </section>
  `;
}

function syncTransferToLab() {
  const activeAccount = getActiveAccount();
  if (activeAccount) {
    elements.labAccount.value = activeAccount.id;
  }
  elements.labAmount.value = elements.transferAmount.value;
  elements.labCurrency.value = elements.transferCurrency.value;
  elements.labRecipient.value = elements.transferRecipient.value;
  elements.labMessage.value = elements.transferMessage.value;
  elements.labOtp.value = elements.transferOtp.value;
  updateCurlPreview();
}

function renderTransactionsTable() {
  const transactions = getFilteredTransactions();
  elements.transactionTableBody.innerHTML = transactions.map((transaction) => {
    const account = getActiveAccount();
    const direction = account ? getDirectionForAccount(transaction, account.id) : "ALL";
    const counterparty = direction === "OUTGOING"
      ? `${transaction.recipientName} (${transaction.recipientEmail})`
      : `${transaction.senderName} (${transaction.senderEmail})`;
    const amountClass = direction === "INCOMING" ? "incoming" : "outgoing";
    const amountPrefix = direction === "INCOMING" ? "+" : "-";
    const statusClass = transaction.status === "PROCESSED"
      ? "good"
      : transaction.status === "SCA_CHALLENGE"
        ? "warn"
        : "dark";

    return `
      <tr class="transaction-row">
        <td data-label="Date">${escapeHtml(formatDate(transaction.updatedAt || transaction.createdAt))}</td>
        <td data-label="Counterparty">${escapeHtml(counterparty)}</td>
        <td data-label="Reference">${escapeHtml(transaction.message || transaction.id)}</td>
        <td data-label="Amount" class="amount-cell ${amountClass}">${amountPrefix}${escapeHtml(formatMoney(transaction.amount, transaction.currency))}</td>
        <td data-label="Fee">${escapeHtml(formatMoney(transaction.feeAmount, transaction.currency))}</td>
        <td data-label="Status"><span class="status-pill ${statusClass}">${escapeHtml(formatStatusLabel(transaction.status))}</span></td>
        <td data-label="Receipt" class="transaction-actions-cell">
          ${transaction.receipt ? `<button class="transaction-link" type="button" data-open-receipt="${transaction.id}">View</button>` : "No receipt"}
        </td>
      </tr>
    `;
  }).join("");

  elements.transactionEmptyState.classList.toggle("is-visible", transactions.length === 0);
}

function getFilteredTransactions() {
  if (!state.snapshot) {
    return [];
  }

  const activeAccount = getActiveAccount();
  const search = elements.txSearch.value.trim().toLowerCase();
  const statusFilter = elements.txStatusFilter.value;
  const directionFilter = elements.txDirectionFilter.value;

  return state.snapshot.transactions.filter((transaction) => {
    if (activeAccount) {
      const touchesAccount = transaction.senderAccountId === activeAccount.id || transaction.recipientAccountId === activeAccount.id;
      if (!touchesAccount) {
        return false;
      }
    }

    if (statusFilter !== "ALL" && transaction.status !== statusFilter) {
      return false;
    }

    if (activeAccount && directionFilter !== "ALL") {
      const direction = getDirectionForAccount(transaction, activeAccount.id);
      if (direction !== directionFilter) {
        return false;
      }
    }

    if (!search) {
      return true;
    }

    const haystack = [
      transaction.id,
      transaction.message,
      transaction.senderName,
      transaction.senderEmail,
      transaction.recipientName,
      transaction.recipientEmail
    ].join(" ").toLowerCase();

    return haystack.includes(search);
  });
}

function renderReceiptList(transactions) {
  const activeAccount = getActiveAccount();
  const receipts = transactions.filter((transaction) => {
    if (!transaction.receipt) {
      return false;
    }
    if (!activeAccount) {
      return true;
    }
    return transaction.senderAccountId === activeAccount.id || transaction.recipientAccountId === activeAccount.id;
  });

  if (!receipts.length) {
    elements.receiptList.innerHTML = `
      <div class="receipt-empty">No sandbox receipts are available for the current wallet.</div>
    `;
    return;
  }

  elements.receiptList.innerHTML = receipts.map((transaction) => {
    return `
      <article class="receipt-list-item">
        <div>
          <p class="metric-label">${escapeHtml(transaction.receipt.id)}</p>
          <strong>${escapeHtml(transaction.senderName)} to ${escapeHtml(transaction.recipientName)}</strong>
          <p class="event-copy">${escapeHtml(formatMoney(transaction.amount, transaction.currency))} | ${escapeHtml(formatDate(transaction.receipt.issuedAt))}</p>
        </div>
        <div class="receipt-list-item__footer">
          <span class="status-pill good">${escapeHtml(transaction.receipt.status)}</span>
          <button class="transaction-link" type="button" data-select-receipt="${transaction.id}">Preview</button>
        </div>
      </article>
    `;
  }).join("");
}

function ensureSelectedReceipt(transactions) {
  const stillExists = transactions.find((transaction) => transaction.id === state.selectedReceiptId && transaction.receipt);
  if (stillExists) {
    return;
  }

  const activeAccount = getActiveAccount();
  const firstReceipt = transactions.find((transaction) => {
    if (!transaction.receipt) {
      return false;
    }
    if (!activeAccount) {
      return true;
    }
    return transaction.senderAccountId === activeAccount.id || transaction.recipientAccountId === activeAccount.id;
  }) || transactions.find((transaction) => transaction.receipt);

  state.selectedReceiptId = firstReceipt ? firstReceipt.id : "";
}

function renderReceiptPreview(transactions) {
  const selected = transactions.find((transaction) => transaction.id === state.selectedReceiptId && transaction.receipt);
  if (!selected) {
    elements.receiptMeta.textContent = "Select a processed transaction";
    elements.receiptPreview.innerHTML = `
      <div class="receipt-empty">
        Sandbox receipts appear here after a transfer reaches <strong>PROCESSED</strong>.
      </div>
    `;
    return;
  }

  elements.receiptMeta.textContent = `${selected.receipt.id} | ${formatDate(selected.receipt.issuedAt)}`;
  elements.receiptPreview.innerHTML = buildReceiptMarkup(selected);
}

function buildReceiptMarkup(transaction) {
  const receipt = transaction.receipt;
  const senderName = isPrimaryAccountEmail(transaction.senderEmail)
    ? "Gabriele Navisi"
    : transaction.senderName;
  return `
    <article class="receipt-card">
      <div class="receipt-watermark">PAYMENT RECEIPT</div>
      <div class="receipt-head">
        <div>
          <p class="section-kicker">Receipt number</p>
          <h4>${escapeHtml(receipt.id)}</h4>
        </div>
        <span class="receipt-status">${escapeHtml(receipt.status)}</span>
      </div>
      <div class="receipt-grid">
        <div class="receipt-row">
          <span class="metric-label">Sender</span>
          <strong>${escapeHtml(senderName)}</strong>
          <span>${escapeHtml(transaction.senderEmail)}</span>
        </div>
        <div class="receipt-row">
          <span class="metric-label">Recipient</span>
          <strong>${escapeHtml(transaction.recipientName)}</strong>
          <span>${escapeHtml(transaction.recipientEmail)}</span>
        </div>
        <div class="receipt-row">
          <span class="metric-label">Amount</span>
          <strong>${formatMoney(transaction.amount, transaction.currency)}</strong>
          <span>Fee ${formatMoney(transaction.feeAmount, transaction.currency)}</span>
        </div>
        <div class="receipt-row">
          <span class="metric-label">Total debited</span>
          <strong>${formatMoney(transaction.totalDebit, transaction.currency)}</strong>
          <span>${escapeHtml(transaction.flow)}</span>
        </div>
      </div>
      <p class="receipt-note">
        Payment sent, will reflect on recipient's account once the fee is validated. For further
        enquiries contact emails.skrill@aol.com.
      </p>
    </article>
  `;
}

function renderEvents(container, entries, mode) {
  if (!container) {
    return;
  }

  if (!entries.length) {
    container.innerHTML = `<p class="event-copy">Nothing to show yet.</p>`;
    return;
  }

  container.innerHTML = entries.slice(0, 10).map((entry) => {
    if (mode === "request") {
      return `
        <article class="event-item">
          <div class="event-header">
            <strong>${escapeHtml(entry.method)} ${escapeHtml(entry.path)}</strong>
            <span class="status-pill ${entry.statusCode >= 400 ? "warn" : "good"}">${escapeHtml(String(entry.statusCode))}</span>
          </div>
          <p class="event-copy">${escapeHtml(entry.accountEmail || "Anonymous local request")}</p>
          <p class="event-meta">${escapeHtml(formatDate(entry.createdAt))}</p>
        </article>
      `;
    }

    return `
      <article class="event-item">
        <div class="event-header">
          <strong>${escapeHtml(entry.kind)}</strong>
          <span class="event-meta">${escapeHtml(formatDate(entry.createdAt))}</span>
        </div>
        <p class="event-copy">${escapeHtml(entry.message)}</p>
      </article>
    `;
  }).join("");
}

function renderOtpMailbox(entries) {
  if (!elements.otpMailboxList) {
    return;
  }

  const allEntries = Array.isArray(entries) ? entries : [];
  const selectedAccount = getSelectedAccount();
  const scopedEntries = selectedAccount
    ? allEntries.filter((entry) => entry.accountId === selectedAccount.id)
    : allEntries;

  if (elements.otpMailboxMeta) {
    elements.otpMailboxMeta.textContent = selectedAccount
      ? `Showing OTP events for ${getDisplayAccountName(selectedAccount)}.`
      : "OTP codes generated in local testing appear here only.";
  }

  if (!scopedEntries.length) {
    elements.otpMailboxList.innerHTML = `
      <div class="receipt-empty otp-mailbox-empty">
        No OTP codes have been generated${selectedAccount ? " for this account" : ""} yet.
      </div>
    `;
    return;
  }

  elements.otpMailboxList.innerHTML = scopedEntries.slice(0, 12).map((entry) => {
    const accountLabel = entry.accountEmail && isPrimaryAccountEmail(entry.accountEmail)
      ? "Gabriele Navisi"
      : entry.accountName || "Unknown account";

    return `
      <article class="otp-mailbox-item">
        <div class="otp-mailbox-item__head">
          <div>
            <p class="metric-label">Transfer ID</p>
            <strong>${escapeHtml(entry.transactionId || "Unavailable")}</strong>
          </div>
          <span class="status-pill ${getOtpMailboxTone(entry.status)}">${escapeHtml(formatStatusLabel(entry.status || "GENERATED"))}</span>
        </div>
        <div class="otp-mailbox-item__grid">
          <div class="otp-mailbox-item__cell">
            <span class="metric-label">OTP code</span>
            <strong class="otp-mailbox-item__otp">${escapeHtml(entry.otpCode || "Pending")}</strong>
          </div>
          <div class="otp-mailbox-item__cell">
            <span class="metric-label">Issued</span>
            <strong>${escapeHtml(formatDate(entry.createdAt))}</strong>
          </div>
          <div class="otp-mailbox-item__cell">
            <span class="metric-label">Account</span>
            <strong>${escapeHtml(accountLabel)}</strong>
            <span>${escapeHtml(entry.accountEmail || "Unknown account")}</span>
          </div>
          <div class="otp-mailbox-item__cell">
            <span class="metric-label">Expiry</span>
            <strong>${escapeHtml(formatDate(entry.expiresAt))}</strong>
            <span class="event-meta">${escapeHtml(entry.eventId || "No event ID")}</span>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderUnsupported(items) {
  if (!elements.unsupportedList) {
    return;
  }

  elements.unsupportedList.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function syncPendingChallenge(latestChallenge) {
  const activeAccount = getActiveAccount();
  const relevantChallenge = activeAccount
    ? getPreferredPendingChallenge(activeAccount, state.snapshot ? state.snapshot.transactions : [])
    : latestChallenge && (!activeAccount || latestChallenge.senderAccountId === activeAccount.id)
      ? latestChallenge
      : null;

  if (!relevantChallenge || !relevantChallenge.challenge) {
    elements.challengeBanner.textContent = "No active SCA challenge";
    elements.challengeBanner.className = "status-pill dark challenge-banner";
    state.transferChallengeId = "";
    state.labContext = {
      slipId: "",
      eventId: "",
      clientEventId: "",
      otpCode: ""
    };
    elements.labOtp.value = "";
    elements.transferOtp.value = "";
    return;
  }

  state.labContext = {
    slipId: relevantChallenge.id,
    eventId: relevantChallenge.challenge.eventId || "",
    clientEventId: relevantChallenge.challenge.clientEventId || "",
    otpCode: relevantChallenge.challenge.otpCode || ""
  };
  state.transferChallengeId = relevantChallenge.id;
  elements.challengeBanner.textContent = `Pending SCA · ${relevantChallenge.id}`;
  elements.challengeBanner.className = "status-pill warn challenge-banner";

  elements.challengeBanner.textContent = `Pending SCA on ${relevantChallenge.id}`;
  elements.labOtp.value = state.labContext.otpCode;
}

async function handleLogin(event) {
  event.preventDefault();
  await performDemoLogin(
    normalizeEmailInput(elements.loginEmail.value.trim()),
    normalizeSeedPassword(elements.loginPassword.value)
  );
}

async function handleAccountCreate(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const payload = Object.fromEntries(formData.entries());
  payload.email = normalizeEmailInput(payload.email);
  payload.demoPassword = normalizeSeedPassword(payload.demoPassword);

  try {
    const response = await fetch("/api/accounts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const body = await response.json();
    if (!response.ok) {
      throw new Error(body.error || "Unable to create sandbox account.");
    }

    elements.loginEmail.value = body.account.email;
    elements.loginPassword.value = "";
    elements.loginFeedback.textContent = `Account created for ${body.account.ownerName}. Sign in with the password you just set.`;
    if (elements.registerFeedback) {
      elements.registerFeedback.textContent = "Your wallet profile is ready. You can sign in now.";
    }
    event.currentTarget.reset();
    document.getElementById("startingBalance").value = "2500";
    setAuthMode("login");
    await refreshSnapshot();
    applyDisplayBranding();
  } catch (error) {
    if (elements.registerFeedback) {
      elements.registerFeedback.textContent = error.message;
    }
    applyDisplayBranding();
  }
}

function handleLogout() {
  state.tokens.clear();
  state.activeDemoAccountId = "";
  state.selectedReceiptId = "";
  state.transferPreview = null;
  state.transferChallengeId = "";
  state.withdrawalPreview = null;
  state.labContext = {
    slipId: "",
    eventId: "",
    clientEventId: "",
    otpCode: ""
  };
  window.localStorage.removeItem("sandboxActiveAccountId");
  elements.loginEmail.value = "";
  elements.loginPassword.value = "";
  elements.loginFeedback.textContent = "You have been logged out of the account.";
  if (elements.registerFeedback) {
    elements.registerFeedback.textContent = "Create your profile here, then sign in when you're ready.";
  }
  elements.transferOtp.value = "";
  closeSidebar();
  closeAuthModal();
  updateSessionState(null);
  if (state.snapshot) {
    renderSummary(state.snapshot.summary, state.snapshot.accounts, state.snapshot.transactions);
    renderWallet(state.snapshot.accounts, state.snapshot.transactions);
    renderTransferWorkspace(state.snapshot.accounts, state.snapshot.transactions);
    renderWithdrawalWorkspace(state.snapshot.accounts, state.snapshot.transactions);
    renderReceiptList(state.snapshot.transactions);
    renderReceiptPreview(state.snapshot.transactions);
  }
  setActiveView("overview");
  applyDisplayBranding();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function handleAccountAction(event) {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const loginAccountId = button.getAttribute("data-demo-login-account-id");
  if (loginAccountId && state.snapshot) {
    const account = state.snapshot.accounts.find((item) => item.id === loginAccountId);
    if (account) {
      elements.loginEmail.value = account.email;
      elements.loginPassword.value = "";
      await performDemoLogin(account.email, account.demoPassword || "Sandbox!2026");
    }
    return;
  }

  const accountId = button.getAttribute("data-account-id");
  if (accountId) {
    elements.labAccount.value = accountId;
    setActiveView("developer");
    updateLabHint();
    updateCurlPreview();
    document.getElementById("lab").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

async function handleTransferPreview() {
  const account = getActiveAccount();
  if (!account) {
    elements.transferFeedback.textContent = "Open a sandbox wallet before previewing a transfer.";
    return;
  }

  syncTransferToLab();
  elements.transferFeedback.textContent = "Calculating sandbox fees and available balance...";

  try {
    const plan = buildPresetPlan("preview", account);
    const result = await runPlan(plan, account);
    state.transferPreview = {
      ...result.payload,
      accountId: account.id,
      stage: "PREVIEW"
    };
    showResponse(plan.responseLabel, result.status, result.payload);
    const previewLabel = result.payload.feeLabel || (String(result.payload.feeScope || "").toUpperCase() === "LOCAL"
      ? "Local transfer"
      : "International transfer");
    elements.transferFeedback.textContent = result.payload.canProcess
      ? `Preview ready. ${previewLabel} fee applied for this recipient.`
      : `Preview ready. ${previewLabel} fee applied, but the current wallet balance cannot cover this transfer.`;
    renderTransferWorkspace(state.snapshot ? state.snapshot.accounts : [], state.snapshot ? state.snapshot.transactions : []);
    applyDisplayBranding();
  } catch (error) {
    elements.transferFeedback.textContent = error.message;
    showResponse("TRANSFER PREVIEW", error.status || 400, error.payload || { error: error.message });
    applyDisplayBranding();
  }
}

async function handleTransferSubmit(event) {
  event.preventDefault();
  const account = getActiveAccount();
  if (!account) {
    elements.transferFeedback.textContent = "Open a sandbox wallet before sending a transfer.";
    return;
  }

  syncTransferToLab();
  elements.transferFeedback.textContent = "Submitting sandbox transfer...";

  try {
    const plan = buildPresetPlan("send", account);
    const result = await runPlan(plan, account);
    ingestLabContext(result.payload);
    showResponse(plan.responseLabel, result.status, result.payload);

    const details = result.payload.details || {};
    state.transferPreview = {
      accountId: account.id,
      amount: details.amount,
      currency: details.currency,
      recipientEmail: details.recipientEmail,
      recipientName: details.recipientName,
      feeAmount: details.feeAmount,
      feeScope: details.feeScope,
      feeLabel: details.feeLabel,
      feeRate: details.feeRate,
      fixedFeeAmount: details.fixedFeeAmount,
      feeMessage: details.feeMessage,
      feeComparison: details.feeComparison,
      totalDebit: details.totalDebit,
      message: details.message,
      availableBalance: account.available,
      scaRequired: result.payload.scaRequired,
      slipId: result.payload.id,
      stage: result.payload.scaRequired ? "SCA CHALLENGE" : "PROCESSED"
    };
    state.transferChallengeId = result.payload.scaRequired ? result.payload.id : "";

    if (result.payload.scaRequired) {
      elements.transferFeedback.textContent = "Transfer created. Tap Send OTP below to generate the confirmation code, then verify and finalize it.";
    } else {
      state.selectedReceiptId = result.payload.id;
      elements.transferFeedback.textContent = "Transfer processed. A sandbox receipt is now available.";
    }

    await refreshSnapshot();
    setActiveView(result.payload.scaRequired ? "transfer" : "receipts");
    applyDisplayBranding();
  } catch (error) {
    elements.transferFeedback.textContent = error.message;
    showResponse("TRANSFER SEND", error.status || 400, error.payload || { error: error.message });
    applyDisplayBranding();
  }
}

async function handleTransferOtpIssue() {
  const account = getActiveAccount();
  if (!account) {
    elements.transferFeedback.textContent = "Open an account wallet before generating a confirmation code.";
    return;
  }

  syncTransferToLab();
  elements.transferFeedback.textContent = "Generating confirmation code...";

  try {
    const plan = buildPresetPlan("otp", account);
    const result = await runPlan(plan, account);
    ingestLabContext(result.payload);
    state.transferChallengeId = result.payload.slipId || state.transferChallengeId;
    elements.transferOtp.value = result.payload.sandboxOtp || "";
    showResponse(plan.responseLabel, result.status, result.payload);
    elements.transferFeedback.textContent = `Confirmation code generated. Open Developer tools whenever you want to review the code in the local OTP mailbox.`;
    await refreshSnapshot();
    applyDisplayBranding();
  } catch (error) {
    elements.transferFeedback.textContent = error.message;
    showResponse("TRANSFER OTP", error.status || 400, error.payload || { error: error.message });
    applyDisplayBranding();
  }
}

async function handleTransferComplete() {
  const account = getActiveAccount();
  if (!account) {
    elements.transferFeedback.textContent = "Open a sandbox wallet before finalizing a transfer.";
    return;
  }

  syncTransferToLab();
  elements.transferFeedback.textContent = "Verifying OTP and finalizing transfer...";

  try {
    const verifyPlan = buildPresetPlan("verify", account);
    const verifyResult = await runPlan(verifyPlan, account);
    ingestLabContext(verifyResult.payload);
    state.transferChallengeId = verifyResult.payload.slipId || state.transferChallengeId;

    const finalizePlan = buildPresetPlan("finalize", account);
    const finalizeResult = await runPlan(finalizePlan, account);
    ingestLabContext(finalizeResult.payload);
    showResponse(finalizePlan.responseLabel, finalizeResult.status, finalizeResult.payload);

    state.selectedReceiptId = finalizeResult.payload.id;
    state.transferPreview = {
      ...(state.transferPreview || {}),
      accountId: account.id,
      amount: finalizeResult.payload.details.amount,
      currency: finalizeResult.payload.details.currency,
      recipientEmail: finalizeResult.payload.details.recipientEmail,
      recipientName: finalizeResult.payload.details.recipientName,
      feeAmount: finalizeResult.payload.details.feeAmount,
      feeScope: finalizeResult.payload.details.feeScope,
      feeLabel: finalizeResult.payload.details.feeLabel,
      feeRate: finalizeResult.payload.details.feeRate,
      fixedFeeAmount: finalizeResult.payload.details.fixedFeeAmount,
      feeMessage: finalizeResult.payload.details.feeMessage,
      feeComparison: finalizeResult.payload.details.feeComparison,
      totalDebit: finalizeResult.payload.details.totalDebit,
      message: finalizeResult.payload.details.message,
      slipId: finalizeResult.payload.id,
      stage: "PROCESSED",
      scaRequired: false
    };
    state.transferChallengeId = "";
    elements.transferOtp.value = "";
    elements.transferFeedback.textContent = "Transfer verified and finalized. The sandbox receipt is ready.";
    await refreshSnapshot();
    setActiveView("receipts");
    applyDisplayBranding();
  } catch (error) {
    elements.transferFeedback.textContent = error.message;
    showResponse("TRANSFER COMPLETE", error.status || 400, error.payload || { error: error.message });
    applyDisplayBranding();
  }
}

function handleWithdrawalFormChange() {
  if (!state.snapshot) {
    return;
  }

  const account = getActiveAccount();
  if (state.withdrawalPreview && account && state.withdrawalPreview.accountId === account.id) {
    try {
      state.withdrawalPreview = {
        ...buildWithdrawalDraft(account),
        stage: state.withdrawalPreview.stage || "PREVIEW"
      };
    } catch (error) {
      state.withdrawalPreview = null;
    }
  }
  renderWithdrawalWorkspace(state.snapshot.accounts, state.snapshot.transactions);
  applyDisplayBranding();
}

async function handleWithdrawalPreview() {
  const account = getActiveAccount();
  if (!account) {
    elements.withdrawalFeedback.textContent = "Open an account wallet before previewing a withdrawal.";
    return;
  }

  try {
    state.withdrawalPreview = {
      ...buildWithdrawalDraft(account),
      stage: "PREVIEW"
    };
    elements.withdrawalFeedback.textContent = state.withdrawalPreview.canProcess
      ? `${state.withdrawalPreview.methodLabel} preview ready. Review the estimated debit before submitting the payout request.`
      : `${state.withdrawalPreview.methodLabel} preview ready, but the current wallet balance cannot cover the payout and fee together.`;
    renderWithdrawalWorkspace(state.snapshot ? state.snapshot.accounts : [], state.snapshot ? state.snapshot.transactions : []);
    applyDisplayBranding();
  } catch (error) {
    elements.withdrawalFeedback.textContent = error.message;
    applyDisplayBranding();
  }
}

async function handleWithdrawalSubmit(event) {
  event.preventDefault();
  const account = getActiveAccount();
  if (!account) {
    elements.withdrawalFeedback.textContent = "Open an account wallet before requesting a withdrawal.";
    return;
  }

  try {
    const preview = buildWithdrawalDraft(account);
    state.withdrawalPreview = {
      ...preview,
      stage: "REQUESTED",
      requestedAt: new Date().toISOString()
    };

    elements.withdrawalFeedback.textContent = preview.canProcess
      ? `${preview.methodLabel} request staged successfully. The payout summary is ready for review.`
      : `${preview.methodLabel} request cannot be staged until the wallet has enough balance for the amount and route fee.`;
    renderWithdrawalWorkspace(state.snapshot ? state.snapshot.accounts : [], state.snapshot ? state.snapshot.transactions : []);
    applyDisplayBranding();
  } catch (error) {
    elements.withdrawalFeedback.textContent = error.message;
    applyDisplayBranding();
  }
}

function handleLabControlChange() {
  updateLabHint();
  updateCurlPreview();
  renderOtpMailbox(state.snapshot ? state.snapshot.otpMailbox || [] : []);
  applyDisplayBranding();
}

function handleReceiptSelection(event) {
  const button = event.target.closest("[data-select-receipt]");
  if (!button || !state.snapshot) {
    return;
  }

  state.selectedReceiptId = button.getAttribute("data-select-receipt") || "";
  renderReceiptPreview(state.snapshot.transactions);
}

function handleTransactionAction(event) {
  const button = event.target.closest("[data-open-receipt]");
  if (!button || !state.snapshot) {
    return;
  }

  state.selectedReceiptId = button.getAttribute("data-open-receipt") || "";
  renderReceiptPreview(state.snapshot.transactions);
  openReceiptModal();
}

async function handleLabRun(event) {
  event.preventDefault();
  const account = getSelectedAccount();

  if (!account) {
    showResponse("LAB ERROR", 400, { error: "Select a sandbox account before running a preset." });
    return;
  }

  try {
    const plan = buildPresetPlan(elements.labPreset.value, account);
    const result = await runPlan(plan, account);
    showResponse(plan.responseLabel, result.status, result.payload);
    ingestLabContext(result.payload);
    if (plan.preset === "send" && result.payload && result.payload.scaRequired) {
      elements.labPreset.value = "otp";
    }
    if (plan.preset === "otp" && result.payload && result.payload.sandboxOtp) {
      elements.labPreset.value = "verify";
    }
    if (plan.preset === "verify" && result.payload && result.payload.success) {
      elements.labPreset.value = "finalize";
    }
    if (plan.preset === "finalize" && result.payload && result.payload.status === "PROCESSED") {
      elements.labPreset.value = "history";
    }
    updateLabHint();
    updateCurlPreview();
    await refreshSnapshot();
    applyDisplayBranding();
  } catch (error) {
    const status = error.status || 400;
    showResponse("LAB ERROR", status, error.payload || { error: error.message });
    applyDisplayBranding();
  }
}

function buildPresetPlan(preset, account) {
  if (!account) {
    throw new Error("Select a sandbox account first.");
  }

  const amount = Number(elements.labAmount.value || 0);
  const currency = String(elements.labCurrency.value || account.currency || "EUR").toUpperCase();
  const recipientEmail = normalizeEmailInput(String(elements.labRecipient.value || "").trim().toLowerCase());
  const message = String(elements.labMessage.value || "Sandbox payout rehearsal").trim() || "Sandbox payout rehearsal";
  const pendingTransaction = getPreferredPendingChallenge(account, state.snapshot ? state.snapshot.transactions : []);

  const preferredSlipId = state.transferChallengeId
    || (state.transferPreview && state.transferPreview.accountId === account.id ? state.transferPreview.slipId : "")
    || state.labContext.slipId;
  const slipId = preferredSlipId || (pendingTransaction ? pendingTransaction.id : "");
  const eventId = state.labContext.eventId || (pendingTransaction && pendingTransaction.challenge ? pendingTransaction.challenge.eventId : "") || "";
  const clientEventId = state.labContext.clientEventId || (pendingTransaction && pendingTransaction.challenge ? pendingTransaction.challenge.clientEventId : "") || "";
  const verifyCode = String(elements.labOtp.value || state.labContext.otpCode || "").trim();

  switch (preset) {
    case "token":
      return {
        preset,
        responseLabel: "POST /sandbox/oauth2/token",
        method: "POST",
        path: "/sandbox/oauth2/token",
        requiresToken: false,
        body: {
          account_id: account.id,
          client_id: account.oauthClientId,
          client_secret: account.oauthClientSecret
        }
      };
    case "accounts":
      return {
        preset,
        responseLabel: "GET /sandbox/mobile/v1/accounts",
        method: "GET",
        path: "/sandbox/mobile/v1/accounts",
        requiresToken: true
      };
    case "preview":
      if (!(amount > 0) || !recipientEmail) {
        throw new Error("Preview requests need a positive amount and a recipient email.");
      }
      return {
        preset,
        responseLabel: "GET /sandbox/mobile/me/send-money/preview",
        method: "GET",
        path: `/sandbox/mobile/me/send-money/preview?senderAccountId=${encodeURIComponent(account.id)}&recipientEmail=${encodeURIComponent(recipientEmail)}&amount=${encodeURIComponent(amount)}&currency=${encodeURIComponent(currency)}`,
        requiresToken: true
      };
    case "send":
      if (!(amount > 0) || !recipientEmail) {
        throw new Error("Send-money requests need a positive amount and a recipient email.");
      }
      return {
        preset,
        responseLabel: "POST /sandbox/mobile/me/send-money",
        method: "POST",
        path: "/sandbox/mobile/me/send-money",
        requiresToken: true,
        body: {
          senderAccountId: account.id,
          recipientEmail,
          amount,
          currency,
          message
        }
      };
    case "otp":
      if (!slipId) {
        throw new Error("Send a transfer that opens confirmation first. Transfers from 10, and international transfers from 20, can generate an OTP.");
      }
      return {
        preset,
        responseLabel: "POST /sandbox/mobile/api/2fa/v1/sms-challenge",
        method: "POST",
        path: "/sandbox/mobile/api/2fa/v1/sms-challenge",
        requiresToken: true,
        body: {
          slipId,
          eventId,
          clientEventId
        }
      };
    case "verify":
      if (!slipId) {
        throw new Error("Issue an OTP challenge before verifying it.");
      }
      if (!verifyCode) {
        throw new Error("Enter the sandbox OTP code before verifying it.");
      }
      return {
        preset,
        responseLabel: "POST /sandbox/mobile/api/2fa/v1/otp-verify",
        method: "POST",
        path: "/sandbox/mobile/api/2fa/v1/otp-verify",
        requiresToken: true,
        body: {
          slipId,
          eventId,
          clientEventId,
          verifyCode
        }
      };
    case "finalize":
      if (!slipId) {
        throw new Error("Verify the pending OTP challenge before finalizing the transfer.");
      }
      return {
        preset,
        responseLabel: `POST /sandbox/mobile/me/send-money/${slipId}/finalize`,
        method: "POST",
        path: `/sandbox/mobile/me/send-money/${encodeURIComponent(slipId)}/finalize`,
        requiresToken: true,
        body: {
          eventId,
          clientEventId,
          scaDetails: {
            eventId,
            clientEventId
          }
        }
      };
    case "history":
      return {
        preset,
        responseLabel: "GET /sandbox/mobile/v1/transactions/all-transactions-history",
        method: "GET",
        path: `/sandbox/mobile/v1/transactions/all-transactions-history?accountId=${encodeURIComponent(account.id)}`,
        requiresToken: true
      };
    default:
      throw new Error("Unknown sandbox preset.");
  }
}

async function runPlan(plan, account) {
  const headers = {};

  if (plan.requiresToken) {
    const token = await ensureToken(account);
    headers.Authorization = `Bearer ${token}`;
  }

  if (plan.method !== "GET") {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(plan.path, {
    method: plan.method,
    headers,
    body: plan.method === "GET" ? undefined : JSON.stringify(plan.body || {})
  });

  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) : {};

  if (!response.ok) {
    const error = new Error(payload.error || `Sandbox request failed with status ${response.status}.`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return {
    status: response.status,
    payload
  };
}

async function ensureToken(account) {
  const cachedToken = state.tokens.get(account.id);
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5000) {
    return cachedToken.value;
  }

  const response = await fetch("/sandbox/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      account_id: account.id,
      client_id: account.oauthClientId,
      client_secret: account.oauthClientSecret
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(payload.error || "Unable to issue a sandbox token.");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  state.tokens.set(account.id, {
    value: payload.access_token,
    expiresAt: Date.now() + (Number(payload.expires_in || 3600) * 1000)
  });

  return payload.access_token;
}

async function performDemoLogin(email, password) {
  elements.loginFeedback.textContent = "Opening sandbox wallet...";
  applyDisplayBranding();

  try {
    const response = await fetch("/api/demo-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Unable to open the sandbox wallet.");
    }

    state.activeDemoAccountId = payload.account.id;
    state.transferPreview = null;
    state.transferChallengeId = "";
    state.withdrawalPreview = null;
    window.localStorage.setItem("sandboxActiveAccountId", payload.account.id);
    elements.labAccount.value = payload.account.id;
    updateSessionState(payload.account);
    elements.loginFeedback.textContent = `Sandbox wallet opened for ${payload.account.ownerName}.`;
    closeSidebar();
    closeAuthModal();
    setAuthMode("login");
    await refreshSnapshot();
    setActiveView("overview");
    document.getElementById("developer").scrollIntoView({ behavior: "smooth", block: "start" });
    applyDisplayBranding();
  } catch (error) {
    state.activeDemoAccountId = "";
    window.localStorage.removeItem("sandboxActiveAccountId");
    updateSessionState(null);
    elements.loginFeedback.textContent = error.message;
    applyDisplayBranding();
  }
}

function syncActiveSession(accounts) {
  if (!state.activeDemoAccountId) {
    updateSessionState(null);
    return;
  }

  const activeAccount = accounts.find((account) => account.id === state.activeDemoAccountId) || null;
  if (!activeAccount) {
    state.activeDemoAccountId = "";
    window.localStorage.removeItem("sandboxActiveAccountId");
    updateSessionState(null);
    return;
  }

  updateSessionState(activeAccount);
  if (elements.labAccount.querySelector(`option[value="${activeAccount.id}"]`)) {
    elements.labAccount.value = activeAccount.id;
  }
}

function updateSessionState(account) {
  document.body.classList.toggle("is-authenticated", Boolean(account));
  if (!account) {
    closeSidebar();
  }
  elements.headerSession.hidden = !account;
  elements.headerSession.textContent = account ? getDisplayAccountName(account) : "";
  elements.logoutButton.hidden = !account;
  elements.sessionState.textContent = account
    ? `${getDisplayAccountName(account)} | ${account.email}`
    : "No sandbox account signed in";
  syncMenuToggleContext();
  updateTopbarContext();
}

function getActiveAccount(accounts = state.snapshot ? state.snapshot.accounts : []) {
  if (!state.activeDemoAccountId) {
    return null;
  }
  return accounts.find((account) => account.id === state.activeDemoAccountId) || null;
}

function getSelectedAccount() {
  if (!state.snapshot) {
    return null;
  }

  const selectedId = elements.labAccount.value || state.activeDemoAccountId;
  return state.snapshot.accounts.find((account) => account.id === selectedId) || null;
}

function getWalletTransactions(transactions, account) {
  return transactions.filter((transaction) => {
    return transaction.senderAccountId === account.id || transaction.recipientAccountId === account.id;
  });
}

function getPendingChallengesForAccount(accountId, transactions = state.snapshot ? state.snapshot.transactions : []) {
  return transactions
    .filter((transaction) => {
      return transaction.senderAccountId === accountId
        && (transaction.status === "SCA_CHALLENGE" || transaction.status === "OTP_VERIFIED");
    })
    .sort((left, right) => {
      const leftTime = Date.parse(left.updatedAt || left.createdAt || 0);
      const rightTime = Date.parse(right.updatedAt || right.createdAt || 0);
      return rightTime - leftTime;
    });
}

function getPreferredPendingChallenge(account, transactions = state.snapshot ? state.snapshot.transactions : []) {
  if (!account) {
    return null;
  }

  const pendingChallenges = getPendingChallengesForAccount(account.id, transactions);
  if (!pendingChallenges.length) {
    return null;
  }

  const preferredIds = [
    state.transferChallengeId,
    state.transferPreview && state.transferPreview.accountId === account.id ? state.transferPreview.slipId : "",
    state.labContext.slipId
  ].filter(Boolean);

  for (const slipId of preferredIds) {
    const match = pendingChallenges.find((transaction) => transaction.id === slipId);
    if (match) {
      return match;
    }
  }

  return pendingChallenges[0];
}

function getDirectionForAccount(transaction, accountId) {
  return transaction.senderAccountId === accountId ? "OUTGOING" : "INCOMING";
}

function ingestLabContext(body) {
  if (!body || typeof body !== "object") {
    return;
  }

  state.labContext = {
    slipId: body.slipId || body.id || (body.details && body.details.id) || state.labContext.slipId,
    eventId: body.eventId || (body.scaDetails && body.scaDetails.eventId) || state.labContext.eventId,
    clientEventId: body.clientEventId || (body.scaDetails && body.scaDetails.clientEventId) || state.labContext.clientEventId,
    otpCode: body.sandboxOtp || body.otpCode || state.labContext.otpCode
  };

  if (state.labContext.otpCode) {
    elements.labOtp.value = state.labContext.otpCode;
  }

  if (body.status === "PROCESSED") {
    state.labContext = {
      slipId: "",
      eventId: "",
      clientEventId: "",
      otpCode: ""
    };
    elements.labOtp.value = "";
  }

  updateLabHint();
  updateCurlPreview();
}

function showResponse(label, status, payload) {
  elements.responseMeta.textContent = `${label} | HTTP ${status}`;
  elements.responsePreview.classList.remove("empty");
  elements.responsePreview.textContent = JSON.stringify(payload, null, 2);
  applyDisplayBranding();
}

function updateLabHint() {
  const preset = elements.labPreset.value;
  const hasChallenge = Boolean(state.labContext.slipId);

  if ((preset === "otp" || preset === "verify" || preset === "finalize") && !hasChallenge) {
    elements.labHint.textContent = "Create a transfer that opens confirmation first. Local transfers start at 10, and international transfers start at 20.";
    return;
  }

  const suffix = hasChallenge && (preset === "otp" || preset === "verify" || preset === "finalize")
    ? ` Current slip: ${state.labContext.slipId}.`
    : "";

  elements.labHint.textContent = `${presetHints[preset] || "Select an account and run a sandbox flow."}${suffix}`;
}

function updateCurlPreview() {
  const account = getSelectedAccount();
  if (!account) {
    elements.curlPreview.textContent = "Select a sandbox account to generate a request preview.";
    return;
  }

  try {
    const plan = buildPresetPlan(elements.labPreset.value, account);
    const lines = [`curl -X ${plan.method} "${window.location.origin}${plan.path}"`];

    if (plan.requiresToken) {
      lines.push('  -H "Authorization: Bearer <sandbox_access_token>"');
    }

    if (plan.method !== "GET") {
      lines.push('  -H "Content-Type: application/json"');
      lines.push(`  -d '${JSON.stringify(plan.body, null, 2)}'`);
    }

    elements.curlPreview.textContent = lines.join(" \\\n");
  } catch (error) {
    elements.curlPreview.textContent = error.message;
  }
}

async function copyCurlPreview() {
  const originalLabel = elements.copyCurlButton.textContent;

  try {
    await navigator.clipboard.writeText(normalizeDisplayedTechnicalText(elements.curlPreview.textContent));
    elements.copyCurlButton.textContent = "Copied";
  } catch (error) {
    elements.copyCurlButton.textContent = "Copy failed";
  }

  window.setTimeout(() => {
    elements.copyCurlButton.textContent = originalLabel;
    applyDisplayBranding();
  }, 1400);
}

function openReceiptModal() {
  if (!state.snapshot) {
    return;
  }

  const transaction = state.snapshot.transactions.find((item) => item.id === state.selectedReceiptId && item.receipt);
  if (!transaction) {
    return;
  }

  elements.receiptModalTitle.textContent = transaction.receipt.id;
  elements.receiptModalBody.innerHTML = buildReceiptMarkup(transaction);
  applyDisplayBranding(elements.receiptModalBody);
  elements.receiptModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeReceiptModal() {
  elements.receiptModal.hidden = true;
  document.body.style.overflow = "";
}

function formatMoney(amount, currency) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount || 0));
}

function formatPlainNumber(value) {
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return "Now";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function rebrandText(value) {
  return String(value == null ? "" : value)
    .replace(/@sandbox\.skrill\.local/gi, "@account.skrill.local")
    .replace(/\bsandboxOtp\b/g, "accountOtp")
    .replace(/\bsandbox_access_token\b/g, "Account_access_token")
    .replace(/\/sandbox(?=\/|$)/g, "/Account")
    .replace(/\bSANDBOX\b/g, "ACCOUNT")
    .replace(/\bSandbox\b/g, "Account")
    .replace(/\bsandbox\b/g, "Account")
    .replace(/\bDEMO\b/g, "RECEIPT")
    .replace(/\bDemo\b/g, "Receipt")
    .replace(/\bdemo\b/g, "Receipt");
}

function getDisplayAccountName(account) {
  if (!account) {
    return "";
  }

  return isPrimaryAccountEmail(account.email)
    ? "Gabriele Navisi"
    : String(account.ownerName || "");
}

function isPrimaryAccountEmail(email) {
  return normalizeEmailInput(email).toLowerCase() === "merchant.alpha@sandbox.skrill.local";
}

function normalizeEmailInput(value) {
  return String(value == null ? "" : value).replace(/@account\.skrill\.local/gi, "@sandbox.skrill.local");
}

function normalizeSeedPassword(value) {
  const text = String(value == null ? "" : value);
  return text === "Account!2026" ? "Sandbox!2026" : text;
}

function normalizeDisplayedTechnicalText(value) {
  return String(value == null ? "" : value)
    .replace(/@account\.skrill\.local/gi, "@sandbox.skrill.local")
    .replace(/\baccountOtp\b/g, "sandboxOtp")
    .replace(/\bAccount_access_token\b/g, "sandbox_access_token")
    .replace(/\/Account(?=\/|$)/g, "/sandbox")
    .replace(/\bAccount!2026\b/g, "Sandbox!2026");
}

function applyDisplayBranding(root = document.body) {
  if (!root) {
    return;
  }

  document.title = rebrandText(document.title);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !/(sandbox|demo)/i.test(node.nodeValue)) {
        return NodeFilter.FILTER_REJECT;
      }
      const parent = node.parentElement;
      if (parent && ["SCRIPT", "STYLE"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach((node) => {
    node.nodeValue = rebrandText(node.nodeValue);
  });

  root.querySelectorAll("input, textarea").forEach((field) => {
    if (typeof field.placeholder === "string" && /(sandbox|demo)/i.test(field.placeholder)) {
      field.placeholder = rebrandText(field.placeholder);
    }
    if (typeof field.value === "string" && /(sandbox|demo)/i.test(field.value)) {
      field.value = rebrandText(field.value);
    }
  });
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
