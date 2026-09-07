import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisbursementContainerComponent } from './disbursement-container.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { provideMockStore } from '@ngrx/store/testing';
import { DatePipe } from '@angular/common';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';

describe('DisbursementContainerComponent', () => {
  let component: DisbursementContainerComponent;
  let fixture: ComponentFixture<DisbursementContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DisbursementContainerComponent],
      imports: [
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [IFDatePipe, DatePipe, provideMockStore({})],
    }).compileComponents();

    fixture = TestBed.createComponent(DisbursementContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
