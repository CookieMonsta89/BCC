import { Injectable } from '@angular/core';
import { CanActivate, Router } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class OnlyAdminUsersGuard implements CanActivate {
  constructor(public router: Router) {}

  canActivate() {
    const user = (<any>window).user;
    if (user && user.isAdmin) { return true; }
    this.router.navigate(['/']);
    return false;
  }
}
