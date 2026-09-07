import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ParticipantDetailComponent } from './participant-detail.component';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { AnimationBuilder } from '@angular/animations';

describe('ParticipantDetailComponent', () => {
  let component: ParticipantDetailComponent;
  let fixture: ComponentFixture<ParticipantDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParticipantDetailComponent],
      imports: [
        InputsModule,
        LabelModule,
        DropDownsModule,
        ButtonsModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        { provide: 'windowObject', useValue: window },
        { provide: AnimationBuilder, useValue: {} },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
