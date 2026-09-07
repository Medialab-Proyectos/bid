import { screen, render, fireEvent } from '@testing-library/angular';
import { RContractsExecutionPlaceComponent } from './r-contracts-execution-place.component';
import {
  createExecutionPlaceForm,
  createLocationForm,
} from '../../rebrand-form/forms';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { MasterDataCountryEnum } from '@core/models';

async function setup(
  componentProperties: Partial<RContractsExecutionPlaceComponent> = {}
) {
  const defaultForm = createExecutionPlaceForm();

  const { fixture } = await render(RContractsExecutionPlaceComponent, {
    declarations: [],
    imports: [
      TranslateTestingModule.withTranslations('en', {
        'EX.R_CONTRACTS_EXECUTION_PLACE_LABEL': 'Execution Place',
        'EX.R_CONTRACTS_ADDRESS_LABEL': 'Address',
        'EX.R_CONTRACTS_POSTAL_CODE_LABEL': 'Postal Code',
        'EX.R_CONTRACTS_COUNTRY_LABEL': 'Country',
        'EX.R_CONTRACTS_REQUIRED_FIELD_ERROR': 'This field is required',
        'EX.R_CONTRACTS_ANOTHER_DESTINATION_BTN': 'Add another location',
      }).withDefaultLanguage('en'),
    ],
    schemas: [],
    providers: [],
    componentProperties: {
      form: defaultForm,
      ...componentProperties,
    },
  });

  const component = fixture.componentInstance;

  return {
    fixture,
    component,
  };
}

describe('RContractsExecutionPlaceComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Input properties', () => {
    it('should have form input with default value', async () => {
      const { component } = await setup();

      expect(component.form).toBeDefined();
      expect(component.form.controls.locations).toBeDefined();
    });

    it('should accept custom form', async () => {
      const customForm = createExecutionPlaceForm();
      customForm.controls.locations.push(createLocationForm());

      const { component } = await setup({ form: customForm });

      expect(component.form).toBe(customForm);
      expect(component.locationsFormArray.length).toBe(2);
    });
  });

  describe('locationsFormArray getter', () => {
    it('should return the locations FormArray', async () => {
      const { component } = await setup();

      const formArray = component.locationsFormArray;

      expect(formArray).toBeDefined();
      expect(formArray.length).toBeGreaterThanOrEqual(1);
    });

    it('should return FormArray with controls', async () => {
      const { component } = await setup();

      const formArray = component.locationsFormArray;

      expect(formArray.controls.length).toBeGreaterThan(0);
      expect(formArray.at(0)).toBeDefined();
    });
  });

  describe('addLocation method', () => {
    it('should add a new location to the form array', async () => {
      const { component, fixture } = await setup();

      const initialLength = component.locationsFormArray.length;
      component.addLocation();
      fixture.detectChanges();

      expect(component.locationsFormArray.length).toBe(initialLength + 1);
    });

    it('should create location with proper form structure', async () => {
      const { component, fixture } = await setup();

      component.addLocation();
      fixture.detectChanges();

      const newLocation = component.locationsFormArray.at(
        component.locationsFormArray.length - 1
      );
      expect(newLocation.get('address')).toBeDefined();
      expect(newLocation.get('zipCode')).toBeDefined();
      expect(newLocation.get('country')).toBeDefined();
    });

    it('should update view when location is added', async () => {
      const { component, fixture } = await setup();

      const initialAddresses = document.querySelectorAll(
        'input[formControlName="address"]'
      );
      const initialCount = initialAddresses.length;

      component.addLocation();
      fixture.detectChanges();

      const updatedAddresses = document.querySelectorAll(
        'input[formControlName="address"]'
      );
      expect(updatedAddresses.length).toBe(initialCount + 1);
    });
  });

  describe('removeLocation method', () => {
    it('should remove location at specified index', async () => {
      const { component, fixture } = await setup();

      component.addLocation();
      component.addLocation();
      fixture.detectChanges();

      const initialLength = component.locationsFormArray.length;
      component.removeLocation(1);
      fixture.detectChanges();

      expect(component.locationsFormArray.length).toBe(initialLength - 1);
    });

    it('should not remove location if only one exists', async () => {
      const { component, fixture } = await setup();

      const initialLength = component.locationsFormArray.length;
      component.removeLocation(0);
      fixture.detectChanges();

      expect(component.locationsFormArray.length).toBe(initialLength);
    });

    it('should remove correct location by index', async () => {
      const { component, fixture } = await setup();

      component.addLocation();
      component.addLocation();
      fixture.detectChanges();

      component.locationsFormArray.at(0).get('address')?.setValue('Address 1');
      component.locationsFormArray.at(1).get('address')?.setValue('Address 2');
      component.locationsFormArray.at(2).get('address')?.setValue('Address 3');

      component.removeLocation(1);
      fixture.detectChanges();

      expect(component.locationsFormArray.length).toBe(2);
      expect(component.locationsFormArray.at(0).get('address')?.value).toBe(
        'Address 1'
      );
      expect(component.locationsFormArray.at(1).get('address')?.value).toBe(
        'Address 3'
      );
    });

    it('should allow removing when more than one location exists', async () => {
      const { component, fixture } = await setup();

      component.addLocation();
      fixture.detectChanges();

      expect(component.locationsFormArray.length).toBe(2);

      component.removeLocation(1);
      fixture.detectChanges();

      expect(component.locationsFormArray.length).toBe(1);
    });
  });

  describe('Component rendering', () => {
    it('should render the accordion panel', async () => {
      await setup();

      const accordion = document.querySelector('fi-accordion-panel');
      expect(accordion).toBeInTheDocument();
    });

    it('should render the title', async () => {
      await setup();

      expect(screen.getByText('Execution Place')).toBeInTheDocument();
    });

    it('should render address field', async () => {
      await setup();

      expect(screen.getByText('Address')).toBeInTheDocument();
    });

    it('should render postal code field', async () => {
      await setup();

      expect(screen.getByText('Postal Code')).toBeInTheDocument();
    });

    it('should render country field', async () => {
      await setup();

      expect(screen.getByText('Country')).toBeInTheDocument();
    });

    it('should render add location button', async () => {
      await setup();

      expect(screen.getByText('Add another location')).toBeInTheDocument();
    });

    it('should render add icon in button', async () => {
      await setup();

      const addIcons = document.querySelectorAll('mat-icon');
      const addIcon = Array.from(addIcons).find(
        (icon) => icon.textContent?.trim() === 'add'
      );
      expect(addIcon).toBeInTheDocument();
    });
  });

  describe('Form fields rendering', () => {
    it('should render one location section initially', async () => {
      await setup();

      const locationSections = document.querySelectorAll('.location-section');
      expect(locationSections.length).toBe(1);
    });

    it('should render multiple location sections when added', async () => {
      const { component, fixture } = await setup();

      component.addLocation();
      component.addLocation();
      fixture.detectChanges();

      const locationSections = document.querySelectorAll('.location-section');
      expect(locationSections.length).toBe(3);
    });

    it('should render address input for each location', async () => {
      const { component, fixture } = await setup();

      component.addLocation();
      fixture.detectChanges();

      const addressInputs = document.querySelectorAll(
        'input[formControlName="address"]'
      );
      expect(addressInputs.length).toBe(2);
    });

    it('should render zipCode input for each location', async () => {
      const { component, fixture } = await setup();

      component.addLocation();
      fixture.detectChanges();

      const zipInputs = document.querySelectorAll(
        'input[formControlName="zipCode"]'
      );
      expect(zipInputs.length).toBe(2);
    });

    it('should render country select for each location', async () => {
      const { component, fixture } = await setup();

      component.addLocation();
      fixture.detectChanges();

      const countrySelects = document.querySelectorAll(
        'mat-select[formControlName="country"]'
      );
      expect(countrySelects.length).toBe(2);
    });
  });

  describe('Delete button visibility', () => {
    it('should show delete button for second location', async () => {
      const { component, fixture } = await setup();

      component.addLocation();
      fixture.detectChanges();

      const deleteButtons = document.querySelectorAll(
        'button[mat-icon-button] mat-icon'
      );
      const deleteIcon = Array.from(deleteButtons).find(
        (icon) => icon.textContent?.trim() === 'delete'
      );
      expect(deleteIcon).toBeInTheDocument();
    });

    it('should show delete buttons for all locations except first', async () => {
      const { component, fixture } = await setup();

      component.addLocation();
      component.addLocation();
      fixture.detectChanges();

      const deleteButtons = document.querySelectorAll(
        'button[mat-icon-button] mat-icon'
      );
      const deleteIcons = Array.from(deleteButtons).filter(
        (icon) => icon.textContent?.trim() === 'delete'
      );
      expect(deleteIcons.length).toBe(2);
    });
  });

  describe('Form validation', () => {
    it('should not show error when fields are valid', async () => {
      const { component, fixture } = await setup();
      component.sortedCountries = [
        {
          id: 300,
          name: {
            en: 'Afghanistan',
            es: 'Afganistán',
            fr: 'Afghanistan',
            pt: 'Afeganistão',
          },
          code: 'AF',
          isActive: true,
          isMember: true,
          isBeneficiary: true,
          translatedName: 'Afghanistan',
        },
      ];
      component.locationsFormArray.at(0).get('country').setValue('AF');
      const addressControl = component.locationsFormArray.at(0).get('address');
      addressControl?.setValue('123 Main St');
      addressControl?.markAsTouched();
      fixture.detectChanges();

      expect(
        screen.queryByText('This field is required')
      ).not.toBeInTheDocument();
    });

    it('should not show error for zipCode as it is not required', async () => {
      const { component, fixture } = await setup();
      const sorteCountries: MasterDataCountryEnum[] = [
        {
          id: 300,
          name: {
            en: 'Afghanistan',
            es: 'Afganistán',
            fr: 'Afghanistan',
            pt: 'Afeganistão',
          },
          code: 'AF',
          isActive: true,
          isMember: true,
          isBeneficiary: true,
          translatedName: 'Afghanistan',
        },
      ];
      component.sortedCountries = sorteCountries;

      component.locationsFormArray.at(0).get('country').setValue('AF');
      component.locationsFormArray.at(0).get('address').setValue('123 Main St');
      const zipControl = component.locationsFormArray.at(0).get('zipCode');
      zipControl?.setValue('');
      zipControl?.markAsTouched();
      fixture.detectChanges();

      const errors = screen.queryAllByText('This field is required');
      expect(errors.length).toBe(0);
    });
  });

  describe('Form interaction', () => {
    it('should update form value when address changes', async () => {
      const { component, fixture } = await setup();

      const testValue = '123 Test Street';
      component.locationsFormArray.at(0).get('address')?.setValue(testValue);
      fixture.detectChanges();

      expect(component.locationsFormArray.at(0).get('address')?.value).toBe(
        testValue
      );
    });

    it('should update form value when zipCode changes', async () => {
      const { component, fixture } = await setup();

      const testValue = '12345';
      component.locationsFormArray.at(0).get('zipCode')?.setValue(testValue);
      fixture.detectChanges();

      expect(component.locationsFormArray.at(0).get('zipCode')?.value).toBe(
        testValue
      );
    });

    it('should update form value when country changes', async () => {
      const { component, fixture } = await setup();

      const testValue = 'US';
      component.locationsFormArray.at(0).get('country')?.setValue(testValue);
      fixture.detectChanges();

      expect(component.locationsFormArray.at(0).get('country')?.value).toBe(
        testValue
      );
    });
  });

  describe('Button interactions', () => {
    it('should call addLocation when button is clicked', async () => {
      const { component, fixture } = await setup();

      const addLocationSpy = jest.spyOn(component, 'addLocation');
      const button = screen.getByText('Add another location');

      fireEvent.click(button);
      fixture.detectChanges();

      expect(addLocationSpy).toHaveBeenCalled();
    });

    it('should increase locations count when add button clicked', async () => {
      const { component, fixture } = await setup();

      const initialLength = component.locationsFormArray.length;
      const button = screen.getByText('Add another location');

      fireEvent.click(button);
      fixture.detectChanges();

      expect(component.locationsFormArray.length).toBe(initialLength + 1);
    });

    it('should call removeLocation when delete button is clicked', async () => {
      const { component, fixture } = await setup();

      component.addLocation();
      fixture.detectChanges();

      const removeLocationSpy = jest.spyOn(component, 'removeLocation');
      const deleteButtons = document.querySelectorAll(
        'button[mat-icon-button]'
      );
      const deleteButton = Array.from(deleteButtons).find((button) =>
        button.querySelector('mat-icon')?.textContent?.includes('delete')
      );

      if (deleteButton) {
        fireEvent.click(deleteButton);
        fixture.detectChanges();

        expect(removeLocationSpy).toHaveBeenCalled();
      }
    });
  });

  describe('Layout structure', () => {
    it('should have form-row class', async () => {
      await setup();

      const formRow = document.querySelector('.form-row');
      expect(formRow).toBeInTheDocument();
    });

    it('should have address-field wrapper', async () => {
      await setup();

      const addressField = document.querySelector('.address-field');
      expect(addressField).toBeInTheDocument();
    });

    it('should have zip-field wrapper', async () => {
      await setup();

      const zipField = document.querySelector('.zip-field');
      expect(zipField).toBeInTheDocument();
    });

    it('should have country-field wrapper', async () => {
      await setup();

      const countryField = document.querySelector('.country-field');
      expect(countryField).toBeInTheDocument();
    });

    it('should have add-location-section', async () => {
      await setup();

      const addSection = document.querySelector('.add-location-section');
      expect(addSection).toBeInTheDocument();
    });

    it('should have execution-place-form class', async () => {
      await setup();

      const form = document.querySelector('.execution-place-form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('Form array operations', () => {
    it('should maintain form integrity after multiple adds', async () => {
      const { component, fixture } = await setup();

      component.addLocation();
      component.addLocation();
      component.addLocation();
      fixture.detectChanges();

      expect(component.locationsFormArray.length).toBe(4);
      component.locationsFormArray.controls.forEach((control) => {
        expect(control.get('address')).toBeDefined();
        expect(control.get('zipCode')).toBeDefined();
        expect(control.get('country')).toBeDefined();
      });
    });

    it('should maintain form integrity after add and remove', async () => {
      const { component, fixture } = await setup();

      component.addLocation();
      component.addLocation();
      component.removeLocation(1);
      fixture.detectChanges();

      expect(component.locationsFormArray.length).toBe(2);
      component.locationsFormArray.controls.forEach((control) => {
        expect(control.valid).toBeDefined();
      });
    });
  });

  describe('Form state', () => {
    it('should be able to reset form', async () => {
      const { component, fixture } = await setup();

      component.locationsFormArray.at(0).get('address')?.setValue('Test');
      component.locationsFormArray.at(0).get('zipCode')?.setValue('12345');
      fixture.detectChanges();

      component.form.reset();
      fixture.detectChanges();

      expect(
        component.locationsFormArray.at(0).get('address')?.value
      ).toBeNull();
      expect(
        component.locationsFormArray.at(0).get('zipCode')?.value
      ).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle removing first location when multiple exist', async () => {
      const { component, fixture } = await setup();

      component.addLocation();
      component.addLocation();
      fixture.detectChanges();

      component.removeLocation(0);
      fixture.detectChanges();

      expect(component.locationsFormArray.length).toBe(2);
    });

    it('should handle removing last location when multiple exist', async () => {
      const { component, fixture } = await setup();

      component.addLocation();
      component.addLocation();
      fixture.detectChanges();

      const lastIndex = component.locationsFormArray.length - 1;
      component.removeLocation(lastIndex);
      fixture.detectChanges();

      expect(component.locationsFormArray.length).toBe(2);
    });

    it('should prevent removing when only one location', async () => {
      const { component, fixture } = await setup();

      expect(component.locationsFormArray.length).toBe(1);

      component.removeLocation(0);
      fixture.detectChanges();

      expect(component.locationsFormArray.length).toBe(1);
    });
  });
});
