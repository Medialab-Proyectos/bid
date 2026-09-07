import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityCommentTabstripComponent } from './entity-comment-tabstrip.component';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('EntityCommentTabstripComponent', () => {
  let component: EntityCommentTabstripComponent;
  let fixture: ComponentFixture<EntityCommentTabstripComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EntityCommentTabstripComponent],
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
    });
    fixture = TestBed.createComponent(EntityCommentTabstripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
