import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatFileListComponent } from './mat-file-list.component';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('MatFileListComponent', () => {
  let component: MatFileListComponent;
  let fixture: ComponentFixture<MatFileListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatFileListComponent,
        TranslateTestingModule.withTranslations('en', {}).withDefaultLanguage(
          'en'
        ),
      ],
    });
    fixture = TestBed.createComponent(MatFileListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
