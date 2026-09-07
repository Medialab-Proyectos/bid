import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelModule } from '@progress/kendo-angular-label';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { RowDetailComponent } from './row-detail.component';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';
import { provideMockStore } from '@ngrx/store/testing';

describe('RowDetailComponent', () => {
  let component: RowDetailComponent;
  let fixture: ComponentFixture<RowDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LabelModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      declarations: [RowDetailComponent, IfNumberPipe],
      providers: [provideMockStore({})],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RowDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
