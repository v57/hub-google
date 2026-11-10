/**
 * What a path says about itself in `hub/api/list` (protocol.md section 15): passed in the settings of `post` and
 * `stream`, next to `access`. hub-service before descriptions ignores these fields.
 */
export interface Described {
  title?: string
  description: string
  inputSchema?: Record<string, unknown>
  outputSchema?: Record<string, unknown>
  annotations?: { readOnlyHint?: boolean; destructiveHint?: boolean; idempotentHint?: boolean; openWorldHint?: boolean }
}
// Typed, not `satisfies`: schema literals would widen to `type: string`, which ApiSettings' JSONSchema doesn't take
export type Descriptions = { post: Record<string, Described>; stream: Record<string, Described> }

const verifyOptions = {
  type: 'object',
  description: 'google-auth-library VerifyIdTokenOptions',
  properties: {
    idToken: { type: 'string', description: 'The ID token (a JWT) Google Sign-In gave the app' },
    audience: {
      description: 'Client ID or IDs of the app; the token\'s aud must be one of them. Required unless the service is configured with GOOGLE_CLIENT_IDS, and then it must be among those',
      anyOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    },
    maxExpiry: { type: 'integer', description: 'Longest token lifetime accepted, in seconds' },
  },
  required: ['idToken'],
}
const failures = 'Fails with "audience required" (no audience sent and none configured), "audience not configured", or when the signature, audience, issuer or expiry don\'t check out.'

export const descriptions: Descriptions = {
  post: {
    'google/login': {
      title: 'Verify Google Sign-In',
      description: `Verifies a Google Sign-In ID token against Google's keys and answers its claims. ${failures}`,
      inputSchema: verifyOptions,
      outputSchema: {
        type: 'object',
        description: 'The token\'s claims (TokenPayload)',
        properties: {
          sub: { type: 'string', description: 'The user\'s stable Google id' },
          email: { type: 'string' },
          email_verified: { type: 'boolean' },
          name: { type: 'string' },
          picture: { type: 'string', format: 'uri' },
          hd: { type: 'string', description: 'Google Workspace domain' },
          aud: { type: 'string' },
          iss: { type: 'string' },
          iat: { type: 'integer' },
          exp: { type: 'integer' },
        },
        required: ['sub', 'aud', 'iss'],
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    'google/login/lite': {
      title: 'Google Sign-In user id',
      description: `Verifies a Google Sign-In ID token like google/login and answers only the user id (the sub claim). ${failures}`,
      inputSchema: verifyOptions,
      outputSchema: { type: 'string', description: 'The user\'s stable Google id (sub)' },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
  },
  stream: {},
}
