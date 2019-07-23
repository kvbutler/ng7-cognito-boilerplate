// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
