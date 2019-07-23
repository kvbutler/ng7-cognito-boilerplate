import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
    template: '',
})
export class CodeCallbackComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
      this.authService.getTokens(window.location.search)
        .subscribe(() => {
            this.router.navigate(['/home']);
        });
  }

}
