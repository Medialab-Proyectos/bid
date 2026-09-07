import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotificationsComponent } from './views/notifacions/notificationsEmail.component';
const routes: Routes = [{ path: '', component: NotificationsComponent }];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotifacionsComponentRoutingModule {}
