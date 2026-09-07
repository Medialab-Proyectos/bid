import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessCommentsGroupByProcessComponent } from './process-comments-group-by-process.component';
import { StoreModule } from '@ngrx/store';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProcessCommentsGroupByProcessComponent', () => {
  let component: ProcessCommentsGroupByProcessComponent;
  let fixture: ComponentFixture<ProcessCommentsGroupByProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProcessCommentsGroupByProcessComponent],
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

    fixture = TestBed.createComponent(ProcessCommentsGroupByProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
