import { describe, expect, test } from 'bun:test'
import { generateKeyPairSync, sign } from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import { clientIdsFrom, createGoogleVerifier } from './login'

// Tokens signed here, and an OAuth2Client whose Google keys are ours: no request leaves the machine

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
const kid = 'test-kid'

class OfflineClient extends OAuth2Client {
  override async getFederatedSignonCertsAsync() {
    return { certs: { [kid]: publicKey.export({ format: 'pem', type: 'spki' }).toString() } } as any
  }
}

function token(aud: string) {
  const b64 = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url')
  const now = Math.floor(Date.now() / 1000)
  const signing = `${b64({ alg: 'RS256', kid, typ: 'JWT' })}.${b64({ iss: 'https://accounts.google.com', aud, sub: `user-of-${aud}`, iat: now, exp: now + 300 })}`
  return `${signing}.${sign('sha256', Buffer.from(signing), privateKey).toString('base64url')}`
}

const mine = 'mine.apps.googleusercontent.com'
const theirs = 'theirs.apps.googleusercontent.com'

describe('google/login', () => {
  test('refuses a call without an audience when the service has no client ids', async () => {
    const verify = createGoogleVerifier({ client: new OfflineClient() })
    await expect(verify({ idToken: token(theirs) })).rejects.toBe('audience required')
    await expect(verify({ idToken: token(theirs), audience: [] })).rejects.toBe('invalid audience')
    await expect(verify({ idToken: token(theirs), audience: '' })).rejects.toBe('invalid audience')
  })

  test('checks the audience the call names', async () => {
    const verify = createGoogleVerifier({ client: new OfflineClient() })
    await expect(verify({ idToken: token(mine), audience: mine })).resolves.toMatchObject({ sub: `user-of-${mine}`, aud: mine })
    await expect(verify({ idToken: token(theirs), audience: mine })).rejects.toThrow('Wrong recipient')
  })

  test('uses the configured client ids, and refuses others a call names', async () => {
    const verify = createGoogleVerifier({ client: new OfflineClient(), clientIds: [mine] })
    await expect(verify({ idToken: token(mine) })).resolves.toMatchObject({ aud: mine })
    await expect(verify({ idToken: token(theirs) })).rejects.toThrow('Wrong recipient')
    await expect(verify({ idToken: token(theirs), audience: theirs })).rejects.toBe('audience not configured')
    await expect(verify({ idToken: token(mine), audience: mine })).resolves.toMatchObject({ aud: mine })
  })

  test('refuses malformed calls', async () => {
    const verify = createGoogleVerifier({ client: new OfflineClient(), clientIds: [mine] })
    await expect(verify({} as any)).rejects.toBe('invalid id token')
    await expect(verify(undefined as any)).rejects.toBe('invalid id token')
  })

  test('reads GOOGLE_CLIENT_IDS', () => {
    expect(clientIdsFrom(undefined)).toEqual([])
    expect(clientIdsFrom(' a.apps, b.apps\nc.apps ')).toEqual(['a.apps', 'b.apps', 'c.apps'])
  })
})
