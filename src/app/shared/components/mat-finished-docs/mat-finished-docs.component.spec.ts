import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatFinishedDocsComponent } from './mat-finished-docs.component';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('MatFinishedDocsComponent', () => {
  let component: MatFinishedDocsComponent;
  let fixture: ComponentFixture<MatFinishedDocsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatFinishedDocsComponent,
        TranslateTestingModule.withTranslations('en', {}).withDefaultLanguage(
          'en'
        ),
      ],
    });
    fixture = TestBed.createComponent(MatFinishedDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
