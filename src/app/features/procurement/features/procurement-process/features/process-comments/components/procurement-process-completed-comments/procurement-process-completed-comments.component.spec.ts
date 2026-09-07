import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcurementProcessCompletedCommentsComponent } from './procurement-process-completed-comments.component';
import { StoreModule } from '@ngrx/store';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('ProcurementProcessCompletedCommentsComponent', () => {
  let component: ProcurementProcessCompletedCommentsComponent;
  let fixture: ComponentFixture<ProcurementProcessCompletedCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProcurementProcessCompletedCommentsComponent],
      imports: [
        StoreModule.forRoot({}),
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(
      ProcurementProcessCompletedCommentsComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
