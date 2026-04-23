const PASSKEY_ENABLED_KEY = 'admin_passkey_enabled'
const PASSKEY_CRED_ID_KEY = 'admin_passkey_cred_id'

function toBase64Url(bytes) {
  const bin = String.fromCharCode(...bytes)
  const b64 = btoa(bin)
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(b64url) {
  const b64 = String(b64url ?? '')
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(String(b64url ?? '').length / 4) * 4, '=')
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i)
  return bytes
}

function randomBytes(len) {
  const bytes = new Uint8Array(len)
  crypto.getRandomValues(bytes)
  return bytes
}

export function isPasskeySupported() {
  try {
    return (
      typeof window !== 'undefined' &&
      !!window.PublicKeyCredential &&
      typeof navigator?.credentials?.create === 'function' &&
      typeof navigator?.credentials?.get === 'function'
    )
  } catch {
    return false
  }
}

export function isPasskeyEnabled() {
  try {
    return localStorage.getItem(PASSKEY_ENABLED_KEY) === '1' && !!localStorage.getItem(PASSKEY_CRED_ID_KEY)
  } catch {
    return false
  }
}

export function setPasskeyEnabled(enabled) {
  try {
    localStorage.setItem(PASSKEY_ENABLED_KEY, enabled ? '1' : '0')
  } catch {
    // ignore
  }
}

export function getStoredCredentialId() {
  try {
    return localStorage.getItem(PASSKEY_CRED_ID_KEY) || ''
  } catch {
    return ''
  }
}

export function clearStoredPasskey() {
  try {
    localStorage.removeItem(PASSKEY_CRED_ID_KEY)
    localStorage.setItem(PASSKEY_ENABLED_KEY, '0')
  } catch {
    // ignore
  }
}

export async function registerAdminPasskey({ username = 'admin' } = {}) {
  if (!isPasskeySupported()) throw new Error('PASSKEY_NOT_SUPPORTED')

  const challenge = randomBytes(32)
  const userId = randomBytes(16)

  const publicKey = {
    challenge,
    rp: { name: 'UrSPI Admin' },
    user: {
      id: userId,
      name: username,
      displayName: username,
    },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }], // ES256
    authenticatorSelection: {
      userVerification: 'required',
      residentKey: 'preferred',
    },
    timeout: 60000,
    attestation: 'none',
  }

  const cred = await navigator.credentials.create({ publicKey })
  if (!cred?.rawId) throw new Error('PASSKEY_CREATE_FAILED')

  const credIdB64Url = toBase64Url(new Uint8Array(cred.rawId))
  try {
    localStorage.setItem(PASSKEY_CRED_ID_KEY, credIdB64Url)
    localStorage.setItem(PASSKEY_ENABLED_KEY, '1')
  } catch {
    // ignore
  }

  return { credentialId: credIdB64Url }
}

export async function authenticateAdminWithPasskey() {
  if (!isPasskeySupported()) throw new Error('PASSKEY_NOT_SUPPORTED')

  const credId = getStoredCredentialId()
  if (!credId) throw new Error('PASSKEY_NOT_ENABLED')

  const challenge = randomBytes(32)

  const publicKey = {
    challenge,
    timeout: 60000,
    userVerification: 'required',
    allowCredentials: [
      {
        id: fromBase64Url(credId),
        type: 'public-key',
        transports: ['internal', 'hybrid', 'usb', 'nfc', 'ble'],
      },
    ],
  }

  const assertion = await navigator.credentials.get({ publicKey })
  if (!assertion) throw new Error('PASSKEY_GET_FAILED')

  return true
}

