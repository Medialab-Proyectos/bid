import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastComponent } from './toast.component';
import { EventEmitter } from '@angular/core';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let closeToastEmitter: EventEmitter<boolean>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToastComponent],
    }).compileComponents();
    closeToastEmitter = new EventEmitter<boolean>();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should prevent default event behavior and emit closeToast event', () => {
    const eventMock: Event = {
      preventDefault: jest.fn(),
    } as unknown as Event;

    component.close(eventMock);

    expect(eventMock.preventDefault).toHaveBeenCalled();

    closeToastEmitter.subscribe((value) => {
      expect(value).toBe(true);
    });
  });
});
