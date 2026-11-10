import { Service } from 'hub-service'
import { descriptions } from './descriptions'
import { clientIdsFrom, createGoogleVerifier, type GoogleLogin } from './login'

const verify = createGoogleVerifier({ clientIds: clientIdsFrom(Bun.env.GOOGLE_CLIENT_IDS) })
new Service({ name: 'Login with Google', icon: { text: 'G' } })
  .post('google/login', (body: GoogleLogin) => verify(body), descriptions.post['google/login'])
  .post('google/login/lite', (body: GoogleLogin) => verify(body).then(a => a.sub), descriptions.post['google/login/lite'])
  .start()
