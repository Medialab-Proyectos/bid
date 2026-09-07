import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AppState,
  AppStateWithSelectedProject,
  AppStateWithActivitiesSelectedProject,
} from '@core/store';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Project } from '@core/models';
import { VisibilityService } from '@core/services/view';
import * as sidebarActions from '@core/store/config/sidebar/actions/sidebar.actions';
import { ProjectStoreService } from '@core/services/store-services';
import { ProjectsApiService } from '@core/services/apis';

@Component({
  selector: 'fiduciary-interface-project',
  templateUrl: './project.component.html',
})
export class ProjectComponent implements OnInit, OnDestroy {
  subscriptionCollection: Subscription[] = [];
  isLoading: boolean;
  public expanded: boolean;
  public mobileView = false;
  projectCollection: Project[] = [];
  currentLang: string;

  constructor(
    private readonly visibilityService: VisibilityService,
    readonly storeProject: ProjectStoreService,
    readonly activatedRoute: ActivatedRoute,
    readonly store: Store<AppState>,
    readonly storeSelectedProject: Store<AppStateWithSelectedProject>,
    readonly storeActivitiesSelectedProject: Store<AppStateWithActivitiesSelectedProject>,
    readonly projectSvc: ProjectsApiService
  ) { }

  ngOnInit(): void {
    this.expanded = true;
    this.initProjects();
    this.visibilityService.breadcrumbService.set(
      '@procurement',
      'BREADCRUMB.PROCUREMENT_MANAGEMENT'
    );

    this.store.dispatch(sidebarActions.getSidebar());
    this.initMobileConditionals();
    this.setHeaderVisibility();
  }

  ngOnDestroy(): void {
    this.subscriptionCollection.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.visibilityService.setVisiblityProjectHeader(false);
  }

  setHeaderVisibility(): void {
    this.visibilityService.setVisiblityProjectHeader(true);
  }

  initMobileConditionals(): void {
    const sub = this.visibilityService.sizeWindow().subscribe((data) => {
      this.mobileView = data.mobileView;
    });
    this.subscriptionCollection.push(sub);
  }

  initProjects(): void {
    this.subscriptionCollection.push(
      this.store
        .select('selectedProject')
        .subscribe((data) => (this.projectCollection = [data.selectedProject]))
    );
  }
}
