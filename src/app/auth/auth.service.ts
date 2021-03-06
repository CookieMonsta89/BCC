import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { TokenStorage } from './token.storage';
import { TooltipComponent } from '@angular/material';

@Injectable()
export class AuthService {

  constructor(private http : HttpClient, private token: TokenStorage) {}

  public $userSource = new Subject<any>();

  login(email : string, password : string) : Observable <any> {
    return Observable.create(observer => {
      this.http.post('/api/auth/login', {
        email,
        password
      }).subscribe((res : any) => {
        if (!res.success) {
          observer.next({success: false, errors: res.errors });
          this.signOut();
          observer.complete();
        } else {
          observer.next({success: true, data: {user: res.data.user} });
          this.setUser(res.data.user);
          this.token.saveToken(res.data.token);
          observer.complete();
        }
      }, (err: any) => {
        observer.error(err);
        this.signOut();
        observer.complete();
      });
    });
  }

  createUser(fullname : string, email : string, password : string, repeatPassword : string, role : string) : Observable <any> {
    return Observable.create(observer => {
      this.http.post('/api/users', {
        fullname,
        email,
        password,
        repeatPassword,
        role,
      }).subscribe((data : any) => {
        observer.next(data);
        observer.complete();
      })
    });
  }

  updateUser(userId: string, fullname: string, email: string, password: string, repeatPassword: string, role: string) : Observable <any> {
    return Observable.create(observer => {
      this.http.put(`/api/users/${userId}`, {
        fullname,
        email,
        password,
        repeatPassword,
        role,
      }).subscribe((data : any) => {
        observer.next(data);
        observer.complete();
      })
    });
  }

  deleteUser(id: string) : Observable <any> {
    return Observable.create(observer => {
      this.http.delete(`/api/users/${id}`).subscribe((data : any) => {
        observer.next(data);
        observer.complete();
      });
    });
  }

  setUser(user): void {
    if (user) user.isAdmin = (user.role === 'admin');
    this.$userSource.next(user);
    (<any>window).user = user;
  }

  getUser(): Observable<any> {
    return this.$userSource.asObservable();
  }

  me(): Observable<any> {
    return Observable.create(observer => {
      const tokenVal = this.token.getToken();
      if (!tokenVal) return  observer.complete();
      this.http.get('/api/auth/me').subscribe((res : any) => {
        observer.next({user: res.data.user});
        this.setUser(res.data.user);
        observer.complete();
      })
    });
  }

  signOut(): void {
    this.token.signOut();
    this.setUser(null);
    delete (<any>window).user;
  }
}
