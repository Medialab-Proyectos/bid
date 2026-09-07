import { Component, OnDestroy } from '@angular/core';
import { ActivitiesApiService } from '@core/services/apis';
import { ActivitiesActiveObject } from '@core/models/responses/activities-active-response.model';
import { Store } from '@ngrx/store';
import { AppStateWithContact } from '@core/store';
import { ProjectStoreService } from '@core/services/store-services';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
@Component({
  selector: 'fi-activities',
  templateUrl: './activities.component.html',
})
export class ActivitiesComponent implements OnDestroy {
  private readonly subscriptions = new Subscription();
  gridData: any[];
  IS_INTERNAL: boolean;
  public projectBuckets: string[] = [];
  currentCategory: string = this.serviceTranslate.instant('ACTIVITIES.ACTIVE');

  constructor(
    readonly activitiesApi: ActivitiesApiService,
    readonly storeContact: Store<AppStateWithContact>,
    readonly storeProject: ProjectStoreService,
    private readonly serviceTranslate: TranslateService
  ) {
    this.subscriptions.add(
      this.storeContact.select('contact').subscribe((data) => {
        if (data.contact) {
          this.IS_INTERNAL = data.contact.is_internal;
        }
      })
    );

    this.initProjects();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public listItems: Array<string> = [
    this.serviceTranslate.instant('ACTIVITIES.ACTIVE'),
    this.serviceTranslate.instant('ACTIVITIES.FINISHED'),
  ];

  public activityRows: ActivitiesActiveObject[] = [];

  public valueChange(value: any): void {
    this.currentCategory = value;
  }

  initProjects(): void {
    this.subscriptions.add(
      this.storeProject.projects().subscribe((res) => {
        if (res && res.projects.length >= 1) {
          res.projects.forEach((item) => {
            this.projectBuckets.push(item.projectBucketId);
          });
        }
      })
    );
  }
}
