import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  constructor() { }

  isAdminUser() {
    const user = (<any>window).user;
    return user && user.isAdmin;
  }
}
