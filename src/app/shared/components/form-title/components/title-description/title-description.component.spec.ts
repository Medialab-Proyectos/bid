import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TitleDescriptionComponent } from './title-description.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('TitleDescriptionComponent', () => {
  let component: TitleDescriptionComponent;
  let fixture: ComponentFixture<TitleDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      declarations: [TitleDescriptionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TitleDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the title correctly', () => {
    const key = 'exampleKey';
    const expectedTitle = `PROCUREMENT.MILESTONES.${key}`;
    component.title = key;
    fixture.detectChanges();

    expect(component['_title']).toBe(expectedTitle);
  });
  it('should set the description correctly', () => {
    const descriptionKey = 'exampleDescriptionKey';
    const expectedDescription = `PROCUREMENT.MILESTONES.DESCRIPTION.${descriptionKey}`;
    component.description = descriptionKey;
    fixture.detectChanges();

    expect(component['_description']).toBe(expectedDescription);
  });
});
