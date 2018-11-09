import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScriptsComponent } from './scripts/scripts.component';
import { RobotsComponent } from './robots/robots.component';
import { LoginComponent } from './login/login.component'
import { AuthenticationGuardService } from './services/authentication-guard.service'

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'scripts/:id', component: ScriptsComponent, canActivate: [AuthenticationGuardService] },
  { path: 'scripts', component: ScriptsComponent, canActivate: [AuthenticationGuardService] },
  { path: 'robots', component: RobotsComponent, canActivate: [AuthenticationGuardService] },
  { path: 'robots/:id', redirectTo: 'robots/:id/', pathMatch: 'full' },
  { path: 'robots/:id/:script', component: RobotsComponent, canActivate: [AuthenticationGuardService] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
