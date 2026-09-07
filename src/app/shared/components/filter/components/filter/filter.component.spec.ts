import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FilterComponent } from './filter.component';

describe('When user search', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;

  function emitterAndDispacthEventFactory(inputSearch: string) {
    jest.spyOn(component.filterValue, 'emit');
    fixture.detectChanges();
    const rendered = fixture.nativeElement;
    const inputForm: HTMLInputElement = rendered.querySelector(
      '.qa-filterComponent-filter'
    );
    inputForm.value = inputSearch;
    inputForm.dispatchEvent(new Event('input'));
    component.emitFilterValue(inputForm.value);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterComponent],
      imports: [FormsModule, ReactiveFormsModule, InputsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterComponent);
    fixture.debugElement.injector.get<any>(NG_VALUE_ACCESSOR);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  test('Should emit input string value on change value', () => {
    const inputSearch = 'CO-l1229';
    emitterAndDispacthEventFactory(inputSearch);
    expect(component.filterValue.emit).toHaveBeenCalledWith(inputSearch);
  });
  test('Should emit value when user write 3 characters at least', () => {
    const inputSearch = 'CO-';
    component.minLength = 3;
    emitterAndDispacthEventFactory(inputSearch);
    expect(component.filterValue.emit).toHaveBeenCalledWith(inputSearch);
  });
  test('Should emit empty value when value is minor than 3 characters', () => {
    const inputSearch = 'CO';
    component.minLength = 3;
    emitterAndDispacthEventFactory(inputSearch);
    expect(component.filterValue.emit).toHaveBeenCalledWith('');
  });

  it('should writeValue', () => {
    component.writeValue('programa');
    expect(component.filterControl.value).toEqual('programa');
  });

  it('should register on change function', () => {
    const callback = () => {};
    component.registerOnChange(callback);
    expect(component.onChange).toEqual(callback);
  });

  it('should register on touched function', () => {
    const callback = () => {};
    component.registerOnTouched(callback);
    expect(component.onTouched).toEqual(callback);
  });

  it('should disable control', () => {
    component.setDisabledState(true);
    expect(component.filterControl.disabled).toBe(true);
  });

  it('should enable control', () => {
    component.setDisabledState(false);
    expect(component.filterControl.enabled).toBe(true);
  });

  it('should clear input value', () => {
    component.filterControl.setValue('program');
    component.clearValue();
    expect(component.filterControl.value).toBe('');
  });

  it('should emit search event on press enter key', () => {
    const event = { key: 'Enter' } as any;
    const spy = jest.spyOn(component.search, 'emit');
    component.onKeyDown(event);
    expect(spy).toHaveBeenCalledWith(component.filterControl.value);
  });

  it('should not raise a search event when the key pressed is not the enter key', () => {
    const event = { key: 'k' } as any;
    const spy = jest.spyOn(component.search, 'emit');
    component.onKeyDown(event);
    expect(spy).not.toHaveBeenCalled();
  });
});
