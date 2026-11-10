import type { ApiSettings } from 'hub-service'

/**
 * Who may call each path: anyone, on purpose. Each path verifies an ID token the caller presents against Google's
 * public keys and answers what the token already says. The service holds no secret and changes no state, so a grant
 * protects nothing, and apps' own clients can call it on default-deny hubs; hub-service's per-caller rate limit
 * applies. Trust comes from the answer, never from being allowed to ask: the audience is the service's configured
 * client ids (GOOGLE_CLIENT_IDS) or the one the backend passed.
 */
const anyone: ApiSettings = { public: true }

export const access: Record<string, ApiSettings> = {
  'google/login': anyone,
  'google/login/lite': anyone,
}
