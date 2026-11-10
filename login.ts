import { OAuth2Client, type TokenPayload } from 'google-auth-library'

export interface GoogleLogin {
  idToken: string
  /** The app's OAuth client id, or several. Required unless the service is configured with GOOGLE_CLIENT_IDS */
  audience?: string | string[]
  maxExpiry?: number
}

export interface GoogleVerifierOptions {
  /** The client ids this service accepts (GOOGLE_CLIENT_IDS). When set, a call's audience must be among them */
  clientIds?: string[]
  client?: OAuth2Client
}

/** Parses GOOGLE_CLIENT_IDS: client ids separated by commas or whitespace */
export function clientIdsFrom(value: string | undefined) {
  return (value ?? '').split(/[\s,]+/).filter(Boolean)
}

function audiences(value: unknown): string[] | undefined {
  if (value === undefined) return undefined
  const list = Array.isArray(value) ? value : [value]
  if (!list.length || !list.every(id => typeof id === 'string' && id.length > 0)) throw 'invalid audience'
  return list
}

/**
 * Verifies Google ID tokens for the audience the service is configured with, or the one the call names. A call with
 * neither is refused: without an audience, google-auth-library accepts a token issued for any app.
 */
export function createGoogleVerifier({ clientIds = [], client = new OAuth2Client() }: GoogleVerifierOptions = {}) {
  return async function verify(body: GoogleLogin): Promise<TokenPayload> {
    if (!body || typeof body.idToken !== 'string' || !body.idToken) throw 'invalid id token'
    if (body.maxExpiry !== undefined && typeof body.maxExpiry !== 'number') throw 'invalid maxExpiry'
    const requested = audiences(body.audience)
    let audience: string[]
    if (clientIds.length) {
      if (requested && !requested.every(id => clientIds.includes(id))) throw 'audience not configured'
      audience = requested ?? clientIds
    } else {
      if (!requested) throw 'audience required'
      audience = requested
    }
    const ticket = await client.verifyIdToken({ idToken: body.idToken, audience, maxExpiry: body.maxExpiry })
    const payload = ticket.getPayload()
    if (!payload) throw 'invalid id token'
    return payload
  }
}
