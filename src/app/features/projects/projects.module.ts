import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectComponent } from './views/project/project.component';
import { ProjectHeaderComponent } from './components/project-header/project-header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import {
  headerProjectReducer,
  projectReducer,
  selectedProjectReducer,
  sidebarReducer,
} from '@core/store';
import {
  HeadersModule,
  KendoModule,
  PipeModule,
} from '@fiduciary-interface/app/shared';
import { BreadcrumbModule } from 'xng-breadcrumb';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { FlowsStickyFooterModule } from '@fiduciary-interface/app/shared/components/flows-sticky-footer/flows-sticky-footer.module';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';

@NgModule({
  declarations: [ProjectComponent, ProjectHeaderComponent],
  imports: [
    CommonModule,
    PipeModule,
    KendoModule,
    ProjectsRoutingModule,
    FormsModule,
    BreadcrumbModule,
    ReactiveFormsModule,
    HeadersModule,
    TranslateModule,
    FlowsStickyFooterModule,
    StoreModule.forFeature('selectedProject', selectedProjectReducer),
    StoreModule.forFeature('projects', projectReducer),
    StoreModule.forFeature('sidebar', sidebarReducer),
    StoreModule.forFeature('headerProject', headerProjectReducer),
  ],
  providers: [TranslatePipe, IfNumberPipe],
  exports: [ProjectHeaderComponent],
})
export class ProjectsModule {}
