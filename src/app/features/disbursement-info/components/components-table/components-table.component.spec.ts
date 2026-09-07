import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentsTableComponent } from './components-table.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { provideMockStore } from '@ngrx/store/testing';

describe('ComponentsTableComponent', () => {
  let component: ComponentsTableComponent;
  let fixture: ComponentFixture<ComponentsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComponentsTableComponent],
      imports: [
        PipeModule,
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [provideMockStore({})],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
