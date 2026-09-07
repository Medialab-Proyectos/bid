import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompletedCommentsComponent } from './completed-comments.component';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('CompletedCommentsComponent', () => {
  let component: CompletedCommentsComponent;
  let fixture: ComponentFixture<CompletedCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompletedCommentsComponent],
      providers: [TranslatePipe],
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CompletedCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
