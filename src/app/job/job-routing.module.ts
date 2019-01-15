import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';

import { JobListComponent } from './job-list/job-list.component';
import { JobDetailComponent } from './job-detail/job-detail.component';

const routes: Routes = [{
  path: 'job',
  children: [{
    path: '',
    redirectTo: '/job/list',
    pathMatch: 'full'
  }, {
    path: 'list',
    canActivate: [AuthGuard],
    component: JobListComponent
  }, {
    path: 'detail/:number',
    canActivate: [AuthGuard],
    component: JobDetailComponent
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class JobRoutingModule { }
