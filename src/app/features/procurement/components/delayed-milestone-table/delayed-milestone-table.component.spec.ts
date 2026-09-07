import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelayedMilestoneTableComponent } from './delayed-milestone-table.component';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { StoreModule } from '@ngrx/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DelayedMilestoneTableComponent', () => {
  let component: DelayedMilestoneTableComponent;
  let fixture: ComponentFixture<DelayedMilestoneTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DelayedMilestoneTableComponent],
      imports: [
        PipeModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
        StoreModule.forRoot({}),
        HttpClientTestingModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DelayedMilestoneTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
