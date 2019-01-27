import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { HomeComponent } from '../home/home.component';
import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';
import { JobModule } from '../job/job.module';
import { UserModule } from '../user/user.module';

const routes: Routes = [{
  path: '',
  canActivate: [AuthGuard],
  component: HomeComponent
}, {
  path: 'user',
  loadChildren: () => UserModule
}, {
  path: 'job',
  loadChildren: () => JobModule
}, {
  path: 'auth',
  loadChildren: () => AuthModule
}, {
  path: 'admin',
  loadChildren: () => AdminModule
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
  declarations: []
})

export class AppRoutingModule {}
