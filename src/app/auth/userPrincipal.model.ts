
export class UserPrincipal {

    public givenName = '';
    public surname = '';
    public username = '';
    public email = '';
    public phoneNumber = '';
    public scopes: string[] = [];

    constructor(params?: Partial<UserPrincipal>) {
        Object.assign(this, params);
    }

    public static createFromCognitoTokens(idToken: any, accessToken: any): UserPrincipal {
        return new UserPrincipal({
            email: idToken.email,
            username: accessToken.username,
            phoneNumber: idToken.phone_number,
            givenName: idToken.given_name,
            surname: idToken.family_name,
            scopes: accessToken.scope.split(/\s+/),
        });
    }
}
