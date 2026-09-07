import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsContainerComponent } from './comments-container.component';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('CommentsContainerComponent', () => {
  let component: CommentsContainerComponent;
  let fixture: ComponentFixture<CommentsContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommentsContainerComponent],
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
    });
    fixture = TestBed.createComponent(CommentsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
