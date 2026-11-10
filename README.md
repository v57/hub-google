<h1>
  <img alt="Containerization logo" src="./icon.png" width="70" valign="middle">
  &nbsp;Login with Google
</h1>

> Made for [Hub](https://hub.v57.dev)

Google service allows you to verify Login with Google tokens without adding a all dependencies to your server, so it can stay lightweight. 

Run from multiple machines or multiple processes for better performance and uptime

Use Hub Launcher to easily scale it up, increasing number of running processes. As Bun/js/ts is a single core process

## Login Google Google

```ts
const request: Login
const userId: String = await service.send('google/login/lite', request)
```
### Detailed login
```ts
const request: Login
const userInfo: GoogleUser = await service.send('google/login', request)
```
## Types
```ts
interface Login {
  idToken: string
  audience?: string | string[]
  maxExpiry?: number
}

interface GoogleUser {
  /**
   * The Issuer Identifier for the Issuer of the response. Always
   * https://accounts.google.com or accounts.google.com for Google ID tokens.
   */
  iss: string
  /**
   * Access token hash. Provides validation that the access token is tied to the
   * identity token. If the ID token is issued with an access token in the
   * server flow, this is always included. This can be used as an alternate
   * mechanism to protect against cross-site request forgery attacks, but if you
   * follow Step 1 and Step 3 it is not necessary to verify the access token.
   */
  at_hash?: string
  /**
   * True if the user's e-mail address has been verified; otherwise false.
   */
  email_verified?: boolean
  /**
   * An identifier for the user, unique among all Google accounts and never
   * reused. A Google account can have multiple emails at different points in
   * time, but the sub value is never changed. Use sub within your application
   * as the unique-identifier key for the user.
   */
  sub: string
  /**
   * The client_id of the authorized presenter. This claim is only needed when
   * the party requesting the ID token is not the same as the audience of the ID
   * token. This may be the case at Google for hybrid apps where a web
   * application and Android app have a different client_id but share the same
   * project.
   */
  azp?: string
  /**
   * The user's email address. This may not be unique and is not suitable for
   * use as a primary key. Provided only if your scope included the string
   * "email".
   */
  email?: string
  /**
   * The URL of the user's profile page. Might be provided when:
   * - The request scope included the string "profile"
   * - The ID token is returned from a token refresh
   * - When profile claims are present, you can use them to update your app's
   * user records. Note that this claim is never guaranteed to be present.
   */
  profile?: string
  /**
   * The URL of the user's profile picture. Might be provided when:
   * - The request scope included the string "profile"
   * - The ID token is returned from a token refresh
   * - When picture claims are present, you can use them to update your app's
   * user records. Note that this claim is never guaranteed to be present.
   */
  picture?: string
  /**
   * The user's full name, in a displayable form. Might be provided when:
   * - The request scope included the string "profile"
   * - The ID token is returned from a token refresh
   * - When name claims are present, you can use them to update your app's user
   * records. Note that this claim is never guaranteed to be present.
   */
  name?: string
  /**
   * The user's given name, in a displayable form. Might be provided when:
   * - The request scope included the string "profile"
   * - The ID token is returned from a token refresh
   * - When name claims are present, you can use them to update your app's user
   * records. Note that this claim is never guaranteed to be present.
   */
  given_name?: string
  /**
   * The user's family name, in a displayable form. Might be provided when:
   * - The request scope included the string "profile"
   * - The ID token is returned from a token refresh
   * - When name claims are present, you can use them to update your app's user
   * records. Note that this claim is never guaranteed to be present.
   */
  family_name?: string
  /**
   * Identifies the audience that this ID token is intended for. It must be one
   * of the OAuth 2.0 client IDs of your application.
   */
  aud: string
  /**
   * The time the ID token was issued, represented in Unix time (integer
   * seconds).
   */
  iat: number
  /**
   * The time the ID token expires, represented in Unix time (integer seconds).
   */
  exp: number
  /**
   * The value of the nonce supplied by your app in the authentication request.
   * You should enforce protection against replay attacks by ensuring it is
   * presented only once.
   */
  nonce?: string
  /**
   * The hosted G Suite domain of the user. Provided only if the user belongs to
   * a hosted domain.
   */
  hd?: string
  /**
   * The user's locale, represented by a BCP 47 language tag.
   * Might be provided when a name claim is present.
   */
  locale?: string
}
```

## Service reference

### What it does

hub-google verifies Google Sign-In ID tokens for your servers and services, with Google's `google-auth-library`: the
signature against Google's keys, the issuer, the expiry and the audience (your app's client ids, configured on the
service or named by each call; a call with neither is refused). It answers the token's claims (`google/login`) or
only the user's stable id (`google/login/lite`). It holds no secrets and keeps no state. Its only outgoing requests go to Google for the
signing keys.

### Installing it on a Hub

**From the launcher.** The launcher's app catalogue ([hub-store](https://github.com/v57/hub-store) `apps.json`) lists
it as **Login with Google** (`v57/google`, repository `v57/hub-google`). An owner installs it in the Hub app:
**Launcher**, **Get More**, then **Get** (see the Hub app guide's
[Launcher](https://github.com/v57/hub-app/blob/main/docs/Launcher.md) page). The launcher on the hub's machine clones
the repository into its `apps/` folder (`~/Hub/Launcher/apps/hub-google` when it was started with the
[`hub`](https://github.com/v57/hub) CLI), runs `bun install --production --frozen-lockfile` and starts it with `bun .`.
**Instances** in the app's details runs more copies.

**By hand**, on any machine that reaches the hub:

```sh
git clone https://github.com/v57/hub-google.git && cd hub-google
bun install
HUB=ws://127.0.0.1:1997 bun .
```

Configuration:

| Name | Kind | What |
| --- | --- | --- |
| `HUB` | environment | The hub's address. A bare number is a port on this machine. Default `1997`. |
| `GOOGLE_CLIENT_IDS` | environment | Your apps' OAuth client ids, separated by commas. When set, tokens must be issued for one of them, and a call's `audience` may only narrow the list. |
| `auth` | file in the working directory | The service's own key, created on the first run. Keep it: the hub approves the service by this key. |

No Google client secret is needed. Without `GOOGLE_CLIENT_IDS`, each call must name its client id in `audience`. The hub-service SDK reads a few more variables (device key, instance name); see the
[hub-service README](https://github.com/v57/hub-service).

**Hosting approval.** When the service connects, it asks the hub to post its two paths. The hub routes no calls to it
until an owner allows that: the Hub app lists the paths as **Needs approval** on **Services** and the request on
**Requests**, where **Allow** approves exactly those paths for the service's key. The owner call behind it is
`hub/host/update { key, allow: [paths] }`. A service whose key is an owner's needs no approval.

### APIs

The descriptions come from `descriptions.ts`, which the service sends to the hub; `hub/api/list` returns them (the Hub
protocol, `Docs/Devices/protocol.md` section 15 in the Hub workspace).

| Path | Kind | Title | Takes | Returns |
| --- | --- | --- | --- | --- |
| `google/login` | post | Verify Google Sign-In | `{ idToken, audience?, maxExpiry? }` | the token's claims: `sub`, `aud`, `iss`, `iat`, `exp`, and `email`, `email_verified`, `name`, `picture`, `hd` when present ([`GoogleUser`](#types)) |
| `google/login/lite` | post | Google Sign-In user id | `{ idToken, audience?, maxExpiry? }` | `sub`, the user's stable Google id, as a string |

- The body is `google-auth-library`'s `VerifyIdTokenOptions`. `idToken` is the ID token (a JWT) Google Sign-In gave
  the app. `audience` is your client id, or a list of them. `maxExpiry` is the longest token lifetime accepted, in
  seconds.
- `audience` is required unless the service has `GOOGLE_CLIENT_IDS`: a call without one fails with `audience required`,
  since `google-auth-library` would accept a token issued for any app. With `GOOGLE_CLIENT_IDS`, an `audience` outside
  it fails with `audience not configured`.
- Both fail when the signature, audience, issuer or expiry don't check out.

### Permissions

The service doesn't guard its paths (it has no `access.ts`) and doesn't mark them `public`, so the hub decides:

| Caller | On a `default-deny` hub (every new hub) | On an older `default-allow` hub |
| --- | --- | --- |
| An owner of the hub | allowed | allowed |
| A caller an owner granted the path (or a prefix of it) | allowed | allowed |
| Anyone else | refused | allowed, unless a permission group names the path |

Most setups call these paths from a backend server, which then signs the user in. An owner lets that server call
them with a grant (Hub protocol section 6):

```
hub/grant/add { "subject": { "key": "<the server's public key>" }, "object": { "prefix": "google/login" } }
```

`subject` may also be `{ "device": "<device id>" }`, `{ "group": "<group>" }` or `{ "everyone": true }`; `object` may
be `{ "path": "google/login/lite" }` for one path. In the Hub app, the same is **Grant** on a device's **Access** list.

### Testing

```sh
bun install
bun test
```

- `login.test.ts` signs tokens locally and gives `OAuth2Client` its own keys (no request leaves the machine): a call
  without an audience is refused, a token for another client id fails, and `GOOGLE_CLIENT_IDS` limits the audience.
- `descriptions.test.ts` checks that every registered path and kind is described, and that the schemas stay in the
  subset hub-service accepts (hub-service `docs/api-descriptions.md`).
