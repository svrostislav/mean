import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  private authStatus$: Subscription;

  constructor(
    private authService: AuthService
  ) {
    
  }
  ngOnInit() {
    this.isAuthenticated = this.authService.getAuth();
    this.authStatus$ = this.authService.authStatus$
      .subscribe(isAuthenticated => this.isAuthenticated = isAuthenticated);
  }

  ngOnDestroy() {
    this.authStatus$.unsubscribe();
  }

  onLogout() {
    this.authService.logout();
  }
}
