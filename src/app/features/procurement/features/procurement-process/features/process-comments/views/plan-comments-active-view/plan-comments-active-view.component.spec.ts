import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanCommentsActiveViewComponent } from './plan-comments-active-view.component';
import { StoreModule } from '@ngrx/store';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PlanCommentsActiveViewComponent', () => {
  let component: PlanCommentsActiveViewComponent;
  let fixture: ComponentFixture<PlanCommentsActiveViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanCommentsActiveViewComponent],
      imports: [
        StoreModule.forRoot({}),
        MsalTestModule,
        HttpClientTestingModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanCommentsActiveViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
