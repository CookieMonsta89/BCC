import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { JobListComponent } from './job-list/job-list.component';
import { JobDetailComponent } from './job-detail/job-detail.component';
import { JobRoutingModule } from './job-routing.module';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    JobRoutingModule,
  ],
  declarations: [
    JobListComponent,
    JobDetailComponent,
  ],
  providers: []
})
export class JobModule { }
