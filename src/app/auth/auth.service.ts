import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserPrincipal } from './userPrincipal.model';
import { throwError, Observable, of, Subject } from 'rxjs';
import { catchError, map, tap, exhaustMap } from 'rxjs/operators';
import { TokenResponseModel } from './model/tokenResponse.model';
import { SHA256 } from 'crypto-js';
import { Base64Url } from './extensions/Base64Url';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public user: UserPrincipal = new UserPrincipal();
  private http: HttpClient;
  public refreshTokens$: Subject<void> = new Subject<void>();

  constructor(private authHelper: JwtHelperService, private handler: HttpBackend) {
    // Handle case where user does a refresh and user principal needs to be initialized
    if (this.isAuthenticated) {
      this.loadUserDetails();
    }
    // This service should not use the HttpInterceptor registered in AppModule
    this.http = new HttpClient(handler);
    // Ignore other refresh token calls while current refresh is in progress
    this.refreshTokens$ = new Subject();
    this.refreshTokens$.pipe(
        exhaustMap(_ => this.refreshTokens())
    ).subscribe();
  }

  /**
   * Checks users authentication status
   * @returns A boolean value
   */
  public get isAuthenticated(): boolean {
    return !this.authHelper.isTokenExpired(sessionStorage.getItem('idToken'))
      && !this.authHelper.isTokenExpired(sessionStorage.getItem('accessToken'));
  }

  /**
   * Returns the token expiration time in ms (from 01/01/1970 UTC)
   */
  public get tokenExpiration(): number {
    return parseInt(sessionStorage.getItem('expires'), 10);
  }

  /**
   * Returns the access token
   */
  public get accessToken(): string {
    return sessionStorage.getItem('accessToken');
  }

  /**
   * Returns the id token
   */
  public get idToken(): string {
    return sessionStorage.getItem('idToken');
  }

  /**
   * Returns the refresh token
   */
  public get refreshToken(): string {
    return sessionStorage.getItem('refreshToken');
  }

  /**
   * Redirect user to authorization endpoint to authenticate
   */
  public login(): void {

    const qs = {
      response_type: 'code',
      client_id: environment.clientId,
      redirect_uri: environment.redirectUri,
      state: this.generateState(),
      scope: 'openid+profile',
      code_challenge_method: 'S256', // PKCE, necessary to secure public clients (prevents auth code interception)
      code_challenge: SHA256(this.generateCodeChallenge()).toString(new Base64Url())
    };
    window.location.href = `${environment.authEndpoint}?${this.objectToQS(qs)}`;
  }

  /**
   * Redirect user to logout endpoint
   */
  public logout(): void {
    sessionStorage.clear();
    const qs = {
      client_id: environment.clientId,
      logout_uri: environment.logoutRedirectUri
    };
    window.location.href =  `${environment.logoutEndpoint}?${this.objectToQS(qs)}`;
  }

  /**
   * Returns an observable that attempts to retrieve tokens using the authorization code grant
   * @param qs The authorization callback querystring
   */
  public getTokens(qs: string): Observable<TokenResponseModel> {
    const authCode = this.qsToObject(qs);
    if (this.checkState(authCode.state)) {
      const params = new HttpParams()
        .set('grant_type', 'authorization_code')
        .set('client_id', environment.clientId)
        .set('code', authCode.code)
        .set('redirect_uri', environment.redirectUri)
        .set('code_verifier', sessionStorage.getItem('codeChallenge'));
      return this.http.post(environment.tokenEndpoint,
        params.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
        .pipe(
          map(resp => TokenResponseModel.createForCognitoResponse(resp as any)),
          tap(this.processTokenResponse.bind(this)),
          catchError(this.handleError)
        );
    }
    return throwError('Invalid state.');
  }

  /**
   * The instance Subject refreshTokens$ should emit the next value triggering refresh logic if not in progress already
   */
  public requestTokenRefresh(): void {
    this.refreshTokens$.next();
  }

  /**
   * Transparently renews tokens
   * @returns An Observable containing the token refresh request logic
   */
  private refreshTokens(): Observable<TokenResponseModel> {
    const params = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('client_id', environment.clientId)
      .set('refresh_token', sessionStorage.getItem('refreshToken'));

    return this.http.post(
      environment.tokenEndpoint, params.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      .pipe(
        map(resp => TokenResponseModel.createForCognitoResponse(resp as any)),
        tap(this.processTokenResponse.bind(this)),
        catchError(this.handleError));
  }

  /**
   * Generates random string for state param which will be verified on auth response
   */
  private generateState(): string {
    const state = this.generateRandomString();
    sessionStorage.setItem('state', state);
    return state;
  }

  /**
   * Generates random string for code_challenge param which will be verified in the token request
   */
  private generateCodeChallenge(): string {
    const codeChallenge = this.generateRandomString(64);
    sessionStorage.setItem('codeChallenge', codeChallenge);
    return codeChallenge;
  }

 /**
  * Generates a random string of the specified length from the charset [A-Z]
  * @param length The length of the random string
  * @returns A random string of the specified length
  */
  private generateRandomString(length: number = 6): string {
    let rand = '';
    while (length-- > 0) {
      // tslint:disable-next-line: no-bitwise
      rand += String.fromCharCode('A'.charCodeAt(0) + 26 * Math.random() | 0);
    }
    return rand;
  }

  /**
   * Validates the authentication response state
   * @param state The state being checked against the previously stored value
   * @returns A boolean value representing a valid response state
   */
  private checkState(state: string): boolean {
    return sessionStorage.getItem('state') === state;
  }

  /**
   * Converts an object into a querystring
   * @param o The object to convert
   * @returns A string representing the object in qs format
   */
  private objectToQS(o: object): string {
    return Object.keys(o).map(key => `${key}=${o[key].toString()}`).join('&');
  }

  /**
   * Parses the given querystring
   * @param qs The string to parse
   * @returns The parsed object or empty for a malformed string
   */
  private qsToObject(qs: string): any {
    if (qs) {
      qs = qs.replace(/^\??(.*)/, '$1');
      return qs.split('&').map(pairs => pairs.split('=')).reduce((parsed, pair) => {
        if (pair.length === 2) {
          parsed[pair[0]] = pair[1];
          return parsed;
        }
      }, {});
    }
    return {};
  }

  /**
   * Handles token response storing values in session storage
   * @param tokenData The token response model
   */
  private processTokenResponse(tokenData: TokenResponseModel): Observable<TokenResponseModel> {
    sessionStorage.setItem('accessToken', tokenData.accessToken);
    sessionStorage.setItem('refreshToken', tokenData.refreshToken);
    sessionStorage.setItem('idToken', tokenData.idToken);
    sessionStorage.setItem('expires', tokenData.expires.toString());
    this.loadUserDetails();
    if (!this.isAuthenticated) {
      throwError('Error occurred during authentication');
    }
    return of(tokenData);
  }

  private loadUserDetails(): void {
    this.user = UserPrincipal.createFromCognitoTokens(
      this.authHelper.decodeToken(sessionStorage.getItem('idToken')), this.authHelper.decodeToken(sessionStorage.getItem('accessToken')));
  }

  /**
   * Service error handler
   * @param error The error response
   */
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      console.error(`${error.status}: ${error.message}`);
    }
    // return an observable with a user-facing error message
    return throwError('We\'re sorry an unexpected error occurred.');
  }

}
