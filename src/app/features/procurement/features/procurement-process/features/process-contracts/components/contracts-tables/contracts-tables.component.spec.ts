import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractsTablesComponent } from './contracts-tables.component';
import { DialogModule, DialogService } from '@progress/kendo-angular-dialog';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { RouterTestingModule } from '@angular/router/testing';
import { MsalProviders } from '../../../../../../../../../test/test-helpers';

describe('ContractsTablesComponent', () => {
  let component: ContractsTablesComponent;
  let fixture: ComponentFixture<ContractsTablesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContractsTablesComponent],
      imports: [
        DialogModule,
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        ...MsalProviders,
        DialogService,
        provideMockStore({}),
        NotificationService,
      ],
    });
    fixture = TestBed.createComponent(ContractsTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
