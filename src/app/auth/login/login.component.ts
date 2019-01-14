import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';

import {AuthService} from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../auth.component.scss']
})
export class LoginComponent implements OnInit {

  private readonly notifier: NotifierService;

  constructor(
    private authService: AuthService,
    private router: Router,
    notifierService: NotifierService,
  ) {
    this.notifier = notifierService;
  }

  email: string;
  password: string;
  loading: boolean;

  ngOnInit() {
    this.loading = false;
  }

  login(): void {
    this.loading = true;
    this.authService.login(this.email, this.password)
    .subscribe(res => {
      this.loading = false;
      if (!res.success) {
        this.notifier.notify('error', `Failed to login. ${res.errors.join(' ')}`);
      } else {
        this.notifier.notify('success', 'You are now logged in.');
        this.router.navigate(['']);
      }
    }, err => {
      this.loading = false;
      this.notifier.notify('error', 'Failed to login.');
    });
  }

}
