import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  public appName = 'App';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.appName = environment.appName;
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/home']);
    }
  }

}
