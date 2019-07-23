export class TokenResponseModel {
    constructor(public accessToken?: string, public refreshToken?: string , public idToken?: string, public expires?: number) { }

    public static createForCognitoResponse(payload: ({
        access_token: string,
        refresh_token: string,
        id_token: string,
        token_type: string,
        expires_in: number
    })): TokenResponseModel {
        return {
            accessToken: payload.access_token,
            refreshToken: payload.refresh_token,
            idToken: payload.id_token,
            expires: Date.now() + payload.expires_in * 1000
        };
    }
}
