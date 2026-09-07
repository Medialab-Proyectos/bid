import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RContractsBidderComponent } from './r-contracts-bidder.component';
import { MatDialogProviders } from '../../../../../../../../../test/test-helpers';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('RContractsBidderComponent', () => {
  let component: RContractsBidderComponent;
  let fixture: ComponentFixture<RContractsBidderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RContractsBidderComponent],
      imports: [
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations('en', {}).withDefaultLanguage(
          'en'
        ),
      ],
      providers: [...MatDialogProviders, provideMockStore({})],
    });
    fixture = TestBed.createComponent(RContractsBidderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
