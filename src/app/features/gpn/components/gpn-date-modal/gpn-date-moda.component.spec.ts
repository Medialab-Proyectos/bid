import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { GpnDateModalComponent } from './gpn-date-modal.component';
import {
  TranslateCompiler,
  TranslateLoader,
  TranslateParser,
  TranslatePipe,
  TranslateStore,
} from '@ngx-translate/core';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('GpnDateModalComponent', () => {
  let component: GpnDateModalComponent;
  let fixture: ComponentFixture<GpnDateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GpnDateModalComponent],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        TranslatePipe,
        TranslateStore,
        TranslateLoader,
        TranslateCompiler,
        TranslateParser,
        {
          provide: DialogRef,
          useValue: {
            close: () => {},
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GpnDateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set the default date to the provided value', () => {
    const providedDate = '2023-08-03T00:00:00.000Z';
    component.defaultDate = providedDate;
    fixture.detectChanges();

    expect(component.defaultDate).toBe(providedDate);
  });

  it('should set the date to the default date when saveDate() is called', () => {
    const providedDate = new Date('2023-08-03');
    component.defaultDate = '2023-08-03';
    fixture.detectChanges();

    component.saveDate();

    expect(component.date).toEqual(providedDate);
  });
});
