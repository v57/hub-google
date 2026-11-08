import { OAuth2Client, type VerifyIdTokenOptions } from 'google-auth-library'
import { Service } from 'hub-service'
import { descriptions } from './descriptions'
const client = new OAuth2Client()
new Service({ name: 'Login with Google', icon: { text: 'G' } })
  .post('google/login', (body: VerifyIdTokenOptions) => client.verifyIdToken(body).then(a => a.getPayload()), descriptions.post['google/login'])
  .post('google/login/lite', (body: VerifyIdTokenOptions) => client.verifyIdToken(body).then(a => a.getPayload()?.sub), descriptions.post['google/login/lite'])
  .start()
