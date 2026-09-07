import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { DocumentDetailComponent } from './document-detail.component';

describe('DocumentDetailComponent', () => {
  let component: DocumentDetailComponent;
  let fixture: ComponentFixture<DocumentDetailComponent>;
  let document: any = {
    id: '1',
    packageName: 'Publication of SPN',
    actualDate: 1626462985634,
    currentFiles: 1,
    maximumFiles: 2,
    state: 'Completado',
    commentsCount: 3,
    enable: true,
    documents: [],
    files: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentDetailComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentDetailComponent);
    component = fixture.componentInstance;
    component.document = document;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit go back event', () => {
    const eventSpy = jest.spyOn(component.goBack, 'emit');

    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();

    expect(eventSpy).toHaveBeenCalled();
  });
});
