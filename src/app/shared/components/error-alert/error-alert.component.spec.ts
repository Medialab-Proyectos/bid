import { ErrorAlertComponent } from './error-alert.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('ErrorAlertComponent', () => {
  let component: ErrorAlertComponent;
  let fixture: ComponentFixture<ErrorAlertComponent>;

  async function setup(
    title: string = 'Error',
    description: string = 'error test'
  ) {
    await TestBed.configureTestingModule({
      imports: [ErrorAlertComponent], // ✅ Para standalone usa imports, no declarations
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorAlertComponent);
    component = fixture.componentInstance;

    // Set inputs
    component.title = title;
    component.description = description;

    fixture.detectChanges();

    return { component, fixture };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display default title', async () => {
    const { fixture } = await setup();
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('.fi-error-alert__title');
    expect(title.textContent).toBe('Error');
  });

  it('should display custom title', async () => {
    const { fixture } = await setup('Custom Error Title');
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('.fi-error-alert__title');
    expect(title.textContent).toBe('Custom Error Title');
  });

  it('should display default description', async () => {
    const { fixture } = await setup();
    const compiled = fixture.nativeElement;
    const description = compiled.querySelector(
      '.fi-error-alert__item > div:last-child'
    );
    expect(description.textContent).toBe('error test');
  });

  it('should display custom description', async () => {
    const { fixture } = await setup('Error', 'This is a custom error message');
    const compiled = fixture.nativeElement;
    const description = compiled.querySelector(
      '.fi-error-alert__item > div:last-child'
    );
    expect(description.textContent).toBe('This is a custom error message');
  });

  it('should have alert role', async () => {
    const { fixture } = await setup();
    const compiled = fixture.nativeElement;
    const alert = compiled.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();
  });

  it('should have aria-live attribute set to assertive', async () => {
    const { fixture } = await setup();
    const compiled = fixture.nativeElement;
    const alert = compiled.querySelector('[aria-live="assertive"]');
    expect(alert).toBeTruthy();
    expect(alert.getAttribute('aria-live')).toBe('assertive');
  });

  it('should display error icon', async () => {
    const { fixture } = await setup();
    const compiled = fixture.nativeElement;
    const icon = compiled.querySelector('mat-icon');
    expect(icon).toBeTruthy();
    expect(icon.textContent.trim()).toBe('error');
  });

  it('should have correct CSS classes', async () => {
    const { fixture } = await setup();
    const compiled = fixture.nativeElement;

    const alertDiv = compiled.querySelector('.fi-error-alert');
    expect(alertDiv).toBeTruthy();
    expect(alertDiv.classList.contains('w-100')).toBe(true);
  });

  it('should have content wrapper', async () => {
    const { fixture } = await setup();
    const compiled = fixture.nativeElement;

    const contentDiv = compiled.querySelector('.fi-error-alert__content');
    expect(contentDiv).toBeTruthy();
  });

  it('should have list container', async () => {
    const { fixture } = await setup();
    const compiled = fixture.nativeElement;

    const listDiv = compiled.querySelector('.fi-error-alert__list');
    expect(listDiv).toBeTruthy();
  });

  it('should have item container', async () => {
    const { fixture } = await setup();
    const compiled = fixture.nativeElement;

    const itemDiv = compiled.querySelector('.fi-error-alert__item');
    expect(itemDiv).toBeTruthy();
  });

  it('should update title when input changes', async () => {
    const { component, fixture } = await setup('Initial Title');

    component.title = 'Updated Title';
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('.fi-error-alert__title');
    expect(title.textContent).toBe('Updated Title');
  });

  it('should update description when input changes', async () => {
    const { component, fixture } = await setup('Error', 'Initial description');

    component.description = 'Updated description';
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const description = compiled.querySelector(
      '.fi-error-alert__item > div:last-child'
    );
    expect(description.textContent).toBe('Updated description');
  });

  it('should handle empty description', async () => {
    const { component, fixture } = await setup('Error', '');

    expect(component.description).toBe('');

    const descriptionDiv = fixture.nativeElement.querySelector(
      '.fi-error-alert__item > div:last-child'
    );
    expect(descriptionDiv.textContent.trim()).toBe('');
  });

  it('should render description when provided after being undefined', async () => {
    const { component, fixture } = await setup('Error', undefined);

    component.description = 'New description';
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const description = compiled.querySelector(
      '.fi-error-alert__item > div:last-child'
    );
    expect(description.textContent).toBe('New description');
  });

  it('should have title input with default value', async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorAlertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorAlertComponent);
    component = fixture.componentInstance;

    expect(component.title).toBe('Error');
  });

  it('should have description input with default value', async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorAlertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorAlertComponent);
    component = fixture.componentInstance;

    expect(component.description).toBe('error test');
  });
});
