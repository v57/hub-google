import { OAuth2Client, type VerifyIdTokenOptions } from 'google-auth-library'
import { Service } from 'hub-service'
const client = new OAuth2Client()
new Service()
  .post('google/login', (body: VerifyIdTokenOptions) => client.verifyIdToken(body).then(a => a.getPayload()))
  .post('google/login/lite', (body: VerifyIdTokenOptions) => client.verifyIdToken(body).then(a => a.getPayload()?.sub))
  .start()
