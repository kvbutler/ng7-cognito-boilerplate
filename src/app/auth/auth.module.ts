import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRegisterComponent } from './login-register/login-register.component';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClientModule } from '@angular/common/http';
import { CodeCallbackComponent } from './codeCallback.component';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

export function jwtOptionsFactory(service: AuthService, router: Router) {
  return {
    tokenGetter: () => {

      if (Date.now() > service.tokenExpiration) {
        // User's session has expired because they have not made a request in the last 10 minutes of token life
        sessionStorage.clear();
        router.navigate(['/']);
        return '';
      } else if (Date.now() + 1000 * environment.expireOffsetRenewSeconds > service.tokenExpiration) {
        // Refresh tokens transparently
        service.requestTokenRefresh();
      }
      return service.idToken;
    },
    whitelistedDomains: [environment.apiDomain],
    authScheme: ''
  };
}

@NgModule({
  declarations: [
    LoginRegisterComponent,
    CodeCallbackComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    { provide: JwtHelperService, useValue: new JwtHelperService() },
    AuthGuard
  ],
  exports: [
    LoginRegisterComponent
  ]
})
export class AuthModule { }
