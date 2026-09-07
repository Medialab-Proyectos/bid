import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { UndbBtnsComponent } from './undb-btns.component';
import { of } from 'rxjs';
import { RouteTestProviders } from '@fiduciary-interface/test/test-helpers';

// Mock services
export const mockMatDialog = {
  open: jest.fn().mockReturnValue({
    afterClosed: jest.fn().mockReturnValue(of({})),
    componentInstance: {},
  }),
};
// Providers para UndbBtnsComponent
export const undbBtnsTestProviders = [
  { provide: MatDialog, useValue: mockMatDialog },
  ...RouteTestProviders,
];

describe('UndbBtnsComponent', () => {
  let component: UndbBtnsComponent;
  let fixture: ComponentFixture<UndbBtnsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UndbBtnsComponent],
      providers: [...undbBtnsTestProviders],
    });

    fixture = TestBed.createComponent(UndbBtnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
