import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { UserListComponent } from './user-list/user-list.component';
import { UserRoutingModule } from './user-routing.module';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    UserRoutingModule,
  ],
  declarations: [
    UserListComponent,
  ],
  providers: []
})
export class UserModule { }
