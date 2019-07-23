export const environment = {
  production: false,
  appName: 'App',
  region: 'us-east-1',
  clientId: 'a9rslk4vskruvhk35ih4nlpi6',
  userPoolId: 'us-east-1_bUawf4yKZ',
  identityPoolId: 'TODO',
  domain: 'localhost:4200',
  apiDomain: 'bimd3q13l6.execute-api.us-east-1.amazonaws.com',
  authDomainPrefix: 'spa',
  expireOffsetRenewSeconds: 600,
  get redirectUri(): string {
     return `http://${this.domain}/auth/code`;
  },
  get logoutRedirectUri(): string {
    return `http://${this.domain}`;
  },
  get authEndpoint(): string {
    return `https://${this.authDomainPrefix}.auth.${this.region}.amazoncognito.com/oauth2/authorize`;
  },
  get tokenEndpoint(): string {
    return `https://${this.authDomainPrefix}.auth.${this.region}.amazoncognito.com/oauth2/token`;
  },
  get logoutEndpoint(): string {
    return `https://${this.authDomainPrefix}.auth.${this.region}.amazoncognito.com/logout`;
  },
  get apiEndpoint(): string {
    return `https://${this.apiDomain}/dev`;
  }
};
