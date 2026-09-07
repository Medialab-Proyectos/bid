import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanCommentsHistoricViewComponent } from './plan-comments-historic-view.component';
import { StoreModule } from '@ngrx/store';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('PlanCommentsHistoricViewComponent', () => {
  let component: PlanCommentsHistoricViewComponent;
  let fixture: ComponentFixture<PlanCommentsHistoricViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanCommentsHistoricViewComponent],
      imports: [
        StoreModule.forRoot({}),
        MsalTestModule,
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanCommentsHistoricViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
