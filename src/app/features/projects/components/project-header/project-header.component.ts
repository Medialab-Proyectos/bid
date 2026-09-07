import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProjectStoreService } from '@core/services/store-services';
import { WindowSizeService } from '@core/services/view';
import { Project } from '@core/models';

@Component({
  selector: 'fi-project-header',
  templateUrl: './project-header.component.html',
  styleUrls: ['./project-header.component.scss'],
})
export class ProjectHeaderComponent implements OnChanges, OnDestroy {
  subscriptionCollection: Subscription[] = [];

  @Input() projects: Project[] = [];
  @Input() isLoading: boolean;

  screenHeight: number;
  screenWidth: number;
  public project: Project;
  public mobileView = false;
  showProjectHeader: boolean;
  public projectName: string;
  public mobileExpanded = false;
  public selectedProject = false;

  constructor(
    readonly windowSvc: WindowSizeService,
    readonly projectStoreSvc: ProjectStoreService
  ) {
    this.initMobileConditionals();
    this.getVisibility();
  }

  ngOnChanges(): void {
    this.project = this.projects[0];
    this.getLanguageSelected();
  }

  ngOnDestroy(): void {
    this.subscriptionCollection.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  getVisibility(): void {
    const sub = this.projectStoreSvc.headerProject().subscribe((data) => {
      this.showProjectHeader = data.headerProject;
    });
    this.subscriptionCollection.push(sub);
  }

  initMobileConditionals(): void {
    const sub = this.windowSvc.windowSizeChanged.subscribe((data) => {
      this.mobileView = data.mobileView;
      this.mobileExpanded = !data.mobileView;
    });
    this.subscriptionCollection.push(sub);
  }

  toogleExpandedData(): void {
    this.mobileExpanded = !this.mobileExpanded;
  }

  getLanguageSelected(): void {
    const sub = this.projectStoreSvc
      .languageSelected()
      .subscribe((preferences) => {
        switch (preferences.preferences.preferredLanguage) {
          case 'en':
            this.projectName = this.project?.name;
            break;
          case 'es':
            this.projectName = this.project?.nameEs.trim()
              ? this.project?.nameEs
              : this.project?.name;
            break;
          case 'fr':
            this.projectName = this.project?.nameFr.trim()
              ? this.project?.nameFr
              : this.project?.name;
            break;
          case 'pt':
            this.projectName = this.project?.namePt.trim()
              ? this.project?.namePt
              : this.project?.name;
            break;
          default:
            this.projectName = this.project?.name;
            break;
        }
      });
    this.subscriptionCollection.push(sub);
  }
}
