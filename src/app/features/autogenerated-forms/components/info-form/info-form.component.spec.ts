import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoFormComponent } from './info-form.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';

describe('InfoFormComponent', () => {
  let component: InfoFormComponent;
  let fixture: ComponentFixture<InfoFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InfoFormComponent, TranslateTestingModule],
      providers: [...commonTestProviders],
    });
    fixture = TestBed.createComponent(InfoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
