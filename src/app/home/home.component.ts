import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppService } from '../app.service';
import { DestructibleComponent } from '../destructible.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends DestructibleComponent implements OnInit, OnDestroy {

  public apiAvailableMsg = 'Attempting to hit API...';

  constructor(private service: AppService) {
    super();
  }

  ngOnInit() {
    super.registerSubscription(this.service.ping().subscribe(() => {
      this.apiAvailableMsg = '<span class="text-success">API online!</span>';
    }, err => this.apiAvailableMsg = '<span class="text-danger">API offline</span>'));
  }

  ngOnDestroy(): void {
    super.destroy();
  }


}
