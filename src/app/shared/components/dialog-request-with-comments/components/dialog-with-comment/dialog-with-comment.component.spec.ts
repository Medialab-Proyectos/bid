import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { StoreModule } from '@ngrx/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DialogWithCommentComponent } from './dialog-with-comment.component';

describe('DialogWithCommentComponent', () => {
  let component: DialogWithCommentComponent;
  let fixture: ComponentFixture<DialogWithCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogWithCommentComponent],
      providers: [TranslatePipe],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogWithCommentComponent);
    component = fixture.componentInstance;
    component.content = [
      {
        key: 'key1',
        text: 'text1',
        bold: true,
      },
      {
        key: 'key2',
        text: 'text2',
        bold: false,
      },
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create form with comment field', () => {
    component.ngOnInit();
    expect(component._commentsForm.contains('comment')).toBe(true);
  });

  it('comment field should be required', () => {
    let control = component._commentsForm.get('comment');
    if (control) {
      control.setValue('');
      expect(control.valid).toBeFalsy();
    }
  });

  it('should populate _commentsForm when input content changes', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const listElement =
      fixture.debugElement.nativeElement.querySelector('#list');
    if (listElement) {
      expect(listElement.innerHTML).toContain('key1');
      expect(listElement.innerHTML).toContain('key2');
    }
  });

  it('should return comment value', () => {
    component._commentsForm.controls.comment.setValue('Test Comment');
    expect(component.comment).toBe('Test Comment');
  });
});
