import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { OnlyAdminUsersGuard } from '../admin/admin-user-guard';

import { UserListComponent } from './user-list/user-list.component';

const routes: Routes = [{
  path: 'user',
  children: [{
    path: '',
    redirectTo: '/user/list',
    pathMatch: 'full'
  }, {
    path: 'list',
    canActivate: [AuthGuard, OnlyAdminUsersGuard],
    component: UserListComponent
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class UserRoutingModule { }
