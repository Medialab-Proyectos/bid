import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { CommentsListComponent } from '@fiduciary-interface/app/shared/components/dialog-comments/components/comments-list/comments-list.component';
import { FilterComponent } from '@fiduciary-interface/app/shared/components/filter/components/filter/filter.component';
import { NoContentComponent } from '@fiduciary-interface/app/shared/components/no-content/components/no-content/no-content.component';
import { StatusLabelComponent } from '@fiduciary-interface/app/shared/components/status-label/components/status-label/status-label.component';
import { provideMockStore } from '@ngrx/store/testing';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { TextBoxModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import {
  AvatarComponent,
  TabStripModule,
} from '@progress/kendo-angular-layout';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { ActivitiesTableComponent } from '../../components/activities-table/activities-table.component';
import { ActivityDetailTabComponent } from '../../components/activities-table/components/activity-detail-tab/activity-detail-tab.component';
import { ActivityTaskTableComponent } from '../../components/activities-table/components/activity-detail-task-table/activity-detail-task-table.component';
import { ActivitiesComponent } from './activities.component';
import { AnimationBuilder } from '@angular/animations';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

describe('ActivitiesComponent', () => {
  let component: ActivitiesComponent;
  let fixture: ComponentFixture<ActivitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ActivitiesComponent,
        ActivitiesTableComponent,
        NoContentComponent,
        FilterComponent,
        StatusLabelComponent,
        ActivityDetailTabComponent,
        ActivityTaskTableComponent,
        CommentsListComponent,
        AvatarComponent,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        TabStripModule,
        TextBoxModule,
        PipeModule,
        FormsModule,
        ReactiveFormsModule,
        DropDownsModule,
        LabelModule,
        TooltipModule,
        MsalTestModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        DatePipe,
        provideMockStore({}),
        { provide: AnimationBuilder, useValue: {} },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
