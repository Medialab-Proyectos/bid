import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MsalModule } from '../../../msal/msal.module';

import { BurgerMenuComponent } from './components/burger-menu/burger-menu.component';
import { HeaderComponent } from './components/header/header.component';
import { HeaderOptionsComponent } from './components/header-options/header-options.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { SecondaryNavComponent } from './components/secondary-nav/secondary-nav.component';
import { UserSideMenuComponent } from './components/user-side-menu/user-side-menu.component';
import { ProjectsSideMenuComponent } from './components/projects-side-menu/projects-side-menu.component';
import { ProjectSidebarComponent } from './components/project-sidebar/project-sidebar.component';

import { TranslateModule, TranslatePipe } from '@ngx-translate/core';

import { KendoModule } from '../../kendo/kendo.module';
import { ProfileCardComponent } from './components/profile-card/profile-card.component';

@NgModule({
  declarations: [
    BurgerMenuComponent,
    HeaderComponent,
    HeaderOptionsComponent,
    MainMenuComponent,
    SecondaryNavComponent,
    UserSideMenuComponent,
    ProjectsSideMenuComponent,
    ProjectSidebarComponent,
    ProfileCardComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    KendoModule,
    FormsModule,
    ReactiveFormsModule,
    MsalModule,
  ],
  exports: [
    BurgerMenuComponent,
    HeaderComponent,
    HeaderOptionsComponent,
    MainMenuComponent,
    SecondaryNavComponent,
    UserSideMenuComponent,
    ProjectsSideMenuComponent,
    ProjectSidebarComponent,
    ProfileCardComponent,
  ],
  providers: [TranslatePipe],
})
export class HeadersModule {}
