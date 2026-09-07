import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UboModalComponent } from './ubo-modal.component';
import { DialogModule, DialogRef } from '@progress/kendo-angular-dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('UboModalComponent', () => {
  let component: UboModalComponent;
  let fixture: ComponentFixture<UboModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UboModalComponent],
      imports: [
        DialogModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        TranslatePipe,
        {
          provide: DialogRef,
          useValue: {
            close: () => {},
            open: () => {},
          },
        },
      ],
    });

    fixture = TestBed.createComponent(UboModalComponent);
    component = fixture.componentInstance;
    component.uboBidders = {
      bidders: [],
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
