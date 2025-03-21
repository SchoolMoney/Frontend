export class Token {
    access_token: string;
    token_type: string;
    expires: number;
    refresh_token: string;

    constructor(access_token: string, token_type: string, expires: number, refresh_token: string) {
        this.access_token = access_token;
        this.token_type = token_type;
        this.expires = expires;
        this.refresh_token = refresh_token;
    }
}
