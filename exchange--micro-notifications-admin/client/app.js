(function () {
  const $ = (id) => document.getElementById(id);
  const responseBox = $('responseBox');

  function saveConfig() {
    const cfg = {
      baseUrl: $('baseUrl').value.trim() || 'http://localhost:3001',
      bearerToken: $('bearerToken').value.trim(),
    };
    localStorage.setItem('notificationsClientConfig', JSON.stringify(cfg));
    return cfg;
  }

  function loadConfig() {
    const raw = localStorage.getItem('notificationsClientConfig');
    const cfg = raw ? JSON.parse(raw) : { baseUrl: 'http://localhost:3001', bearerToken: '' };
    $('baseUrl').value = cfg.baseUrl || 'http://localhost:3001';
    $('bearerToken').value = cfg.bearerToken || '';
    return cfg;
  }

  function setResponse(value, ok = true) {
    responseBox.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    responseBox.className = `bg-gray-900 text-${ok ? 'green' : 'red'}-300 rounded p-3 text-sm overflow-auto max-h-96`;
  }

  async function apiFetch(path, options = {}) {
    const { baseUrl, bearerToken } = loadConfig();
    const headers = {
      'Content-Type': 'application/json',
      'X-Correlation-Id': crypto.randomUUID(),
    };
    if (bearerToken) headers['Authorization'] = `Bearer ${bearerToken}`;

    const res = await fetch(`${baseUrl}${path}`, {
      method: 'GET',
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });

    const text = await res.text();
    let data = text;
    try { data = JSON.parse(text); } catch (_) {}

    if (!res.ok) {
      throw data;
    }
    return data;
  }

  function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');
    tabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabs.forEach((b) => b.classList.remove('bg-blue-600', 'text-white')));
        tabs.forEach((b) => b.classList.add('bg-gray-100'));
        btn.classList.add('bg-blue-600', 'text-white');
        btn.classList.remove('bg-gray-100');
        const tab = btn.getAttribute('data-tab');
        panels.forEach((p) => p.classList.add('hidden'));
        $(`tab-${tab}`).classList.remove('hidden');
      });
    });
  }

  function setEmailTemplateDefaults() {
    const t = $('emailTemplate').value;
    const subjectMap = {
      'auth.verify-email': 'Verify your email',
      'auth.reset-password': 'Reset your password',
      'auth.welcome': 'Welcome!',
      'auth.otp': 'Your verification code',
    };
    $('emailSubject').value = subjectMap[t] || '';

    const variablesMap = {
      'auth.verify-email': { displayName: 'Demo User', verifyUrl: 'https://example.invalid/verify?token=xxxxx--xxxxx' },
      'auth.reset-password': { displayName: 'Demo User', resetUrl: 'https://example.invalid/reset?token=xxxxx--xxxxx' },
      'auth.welcome': { displayName: 'Demo User', dashboardUrl: 'https://example.invalid/dashboard' },
      'auth.otp': { displayName: 'Demo User', code: 'xxxxx--xxxxx', expirationMinutes: 10 },
    };
    $('emailVariables').value = JSON.stringify(variablesMap[t] || {}, null, 2);
  }

  function setSmsTemplateDefaults() {
    const variables = { code: 'xxxxx--xxxxx', expirationMinutes: 10, displayName: 'Demo User' };
    $('smsVariables').value = JSON.stringify(variables, null, 2);
  }

  async function onSendEmail() {
    try {
      const body = {
        to: $('emailTo').value.trim(),
        template: $('emailTemplate').value,
        subject: $('emailSubject').value.trim(),
        variables: JSON.parse($('emailVariables').value || '{}'),
        user_id: $('emailUserId').value.trim(),
        org_id: $('emailOrgId').value.trim() || undefined,
        idempotency_key: $('emailIdemKey').value.trim() || undefined,
        priority: $('emailPriority').value,
      };
      const data = await apiFetch('/notifications/email', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setResponse(data, true);
    } catch (err) {
      setResponse(err, false);
    }
  }

  async function onSendSms() {
    try {
      const body = {
        to: $('smsTo').value.trim(),
        template: $('smsTemplate').value,
        variables: JSON.parse($('smsVariables').value || '{}'),
        user_id: $('smsUserId').value.trim(),
        org_id: $('smsOrgId').value.trim() || undefined,
        idempotency_key: $('smsIdemKey').value.trim() || undefined,
        priority: $('smsPriority').value,
      };
      const data = await apiFetch('/notifications/sms', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setResponse(data, true);
    } catch (err) {
      setResponse(err, false);
    }
  }

  async function onCheckStatus() {
    try {
      const queue = $('statusQueue').value;
      const jobId = $('statusJobId').value.trim();
      const data = await apiFetch(`/notifications/jobs/${queue}/${jobId}/status`);
      setResponse(data, true);
    } catch (err) {
      setResponse(err, false);
    }
  }

  async function onHealth() {
    try {
      const data = await apiFetch('/health');
      setResponse(data, true);
    } catch (err) {
      setResponse(err, false);
    }
  }

  async function onPing() {
    try {
      const data = await apiFetch('/ping');
      setResponse(data, true);
    } catch (err) {
      setResponse(err, false);
    }
  }

  function bindEvents() {
    $('saveConfigBtn').addEventListener('click', () => {
      const cfg = saveConfig();
      setResponse({ message: 'Config saved', cfg }, true);
    });
    $('sendEmailBtn').addEventListener('click', onSendEmail);
    $('sendSmsBtn').addEventListener('click', onSendSms);
    $('checkStatusBtn').addEventListener('click', onCheckStatus);
    $('checkHealthBtn').addEventListener('click', onHealth);
    $('pingBtn').addEventListener('click', onPing);
    $('emailTemplate').addEventListener('change', setEmailTemplateDefaults);
  }

  function initDefaults() {
    const cfg = loadConfig();
    if (!$('emailUserId').value) $('emailUserId').value = crypto.randomUUID();
    if (!$('smsUserId').value) $('smsUserId').value = crypto.randomUUID();
    setEmailTemplateDefaults();
    setSmsTemplateDefaults();
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    bindEvents();
    initDefaults();
  });
})();

