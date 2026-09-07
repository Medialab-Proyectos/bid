import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcurementCommentsGroupByProcessDetailComponent } from './procurement-comments-group-by-process-detail.component';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('ProcurementCommentsGroupByProcessDetailComponent', () => {
  let component: ProcurementCommentsGroupByProcessDetailComponent;
  let fixture: ComponentFixture<ProcurementCommentsGroupByProcessDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProcurementCommentsGroupByProcessDetailComponent],
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(
      ProcurementCommentsGroupByProcessDetailComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
