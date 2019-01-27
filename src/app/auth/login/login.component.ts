import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';

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

  loading: boolean;
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  get email(): any { return this.loginForm.get('email'); }
  get password(): any { return this.loginForm.get('password'); }

  ngOnInit() {
    this.loading = false;
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  login(): void {

    if(!this.loginForm.valid) {
      this.notifier.notify('warning', 'The Login form is not valid. Please try again.');
      this.validateAllFormFields(this.loginForm);
      return;
    }

    let {
      email,
      password
    } = this.loginForm.getRawValue();

    this.loading = true;
    this.authService.login(email, password)
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
