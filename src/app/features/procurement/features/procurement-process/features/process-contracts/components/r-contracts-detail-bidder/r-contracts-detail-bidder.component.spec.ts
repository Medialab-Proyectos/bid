import { screen, render } from '@testing-library/angular';
import { NO_ERRORS_SCHEMA, Component, Input } from '@angular/core';
import { RContractsDetailBidderComponent } from './r-contracts-detail-bidder.component';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { CommonModule } from '@angular/common';
import { ParticipantAwarded } from '@core/models';
import { of } from 'rxjs';

// Mock del componente accordion
@Component({
  selector: 'fi-accordion-panel',
  template: `
    <div>
      <ng-content select="[title]"></ng-content>
      <ng-content select="[body]"></ng-content>
    </div>
  `,
})
class MockAccordionPanelComponent {
  @Input() collapsible = true;
}

const mockParticipants: ParticipantAwarded[] = [
  {
    biddingProcessBidderId: 'bidder-1',
    name: 'Company A',
    nationality: 'Argentina',
    type: 'Corporation',
    biddingProcessParticipantId: 'participant-1',
    weighedTechScore: 85,
    weighedFinancialScore: 90,
    totalScore: 175,
    amount: 100000,
    currency: 'USD',
    result: 1,
  } as ParticipantAwarded,
  {
    biddingProcessBidderId: 'bidder-2',
    name: 'Company B',
    nationality: 'Brazil',
    type: 'LLC',
    biddingProcessParticipantId: 'participant-2',
    weighedTechScore: 80,
    weighedFinancialScore: 85,
    totalScore: 165,
    amount: 95000,
    currency: 'USD',
    result: 2,
  } as ParticipantAwarded,
  {
    biddingProcessBidderId: 'bidder-3',
    name: 'Company C',
    nationality: 'Colombia',
    type: 'Partnership',
    biddingProcessParticipantId: 'participant-3',
    weighedTechScore: 75,
    weighedFinancialScore: 80,
    totalScore: 155,
    amount: 90000,
    currency: 'USD',
    result: 3,
  } as ParticipantAwarded,
];

const mockDialog = {
  open: jest.fn(() => ({
    afterClosed: () => of(true),
  })),
  closeAll: jest.fn(),
};

async function setup(
  componentProperties: Partial<RContractsDetailBidderComponent> = {}
) {
  const fb = new FormBuilder();
  const mockForm = fb.group({
    selectedParticipantId: [null, Validators.required],
  }) as any;

  const { fixture } = await render(RContractsDetailBidderComponent, {
    declarations: [MockAccordionPanelComponent],
    imports: [
      CommonModule,
      ReactiveFormsModule,
      MatRadioModule,
      MatFormFieldModule,
      MatInputModule,
      MatIconModule,
      MatButtonModule,
      MatDialogModule,
      BrowserAnimationsModule,
      TranslateTestingModule.withTranslations('en', {
        'EX.R_CONTRACTS_BIDDER_INFORMATION_LABEL': 'Bidder Information',
        'EX.R_CONTRACTS_NAME_SUCCESSFUL_BIDDER__LABEL':
          'Successful Bidder Name',
        'EX.R_CONTRACTS_BIDDER_NATIONALITY_LABEL': 'Nationality',
        'EX.R_CONTRACTS_BIDDER_TYPE_LABEL': 'Type',
        'EX.R_CONTRACTS_BIDDER_REQUIRED_ERROR': 'Please select a bidder',
      }).withDefaultLanguage('en'),
    ],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [FormBuilder, { provide: MatDialog, useValue: mockDialog }],
    componentProperties: {
      participants: mockParticipants,
      form: mockForm,
      ...componentProperties,
    },
  });

  const component = fixture.componentInstance;

  return {
    fixture,
    component,
  };
}

describe('RContractsDetailBidderComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Input setters', () => {
    it('should set participants signal when participants input changes', async () => {
      const { component } = await setup();

      expect(component.participantsSignal()).toEqual(mockParticipants);
      expect(component.participantsSignal().length).toBe(3);
    });

    it('should set empty array when participants input is null', async () => {
      const { component } = await setup({ participants: null as any });

      expect(component.participantsSignal()).toEqual([]);
    });
  });

  describe('Computed signals', () => {
    it('should compute selectedBidderControl correctly', async () => {
      const { component } = await setup();

      const control = component.selectedBidderControl();
      expect(control).toBeDefined();
      expect(control instanceof FormControl).toBe(true);
    });

    it('should return undefined for selectedBidderControl when form is null', async () => {
      const { component } = await setup({ form: null as any });

      const control = component.selectedBidderControl();
      expect(control).toBeUndefined();
    });

    it('should compute hasParticipants as true when participants exist', async () => {
      const { component } = await setup();

      expect(component.hasParticipants()).toBe(true);
    });

    it('should compute hasParticipants as false when no participants', async () => {
      const { component } = await setup({ participants: [] });

      expect(component.hasParticipants()).toBe(false);
    });

    it('should compute hasParticipants as false when participants is null', async () => {
      const { component } = await setup({ participants: null as any });

      expect(component.hasParticipants()).toBe(false);
    });
  });

  describe('hasError getter', () => {
    it('should return false when control is valid', async () => {
      const { component, fixture } = await setup();

      component.selectedBidderControl()?.setValue('bidder-1');
      fixture.detectChanges();

      expect(component.hasError).toBe(false);
    });

    it('should return true when control is invalid and touched', async () => {
      const { component, fixture } = await setup();

      const control = component.selectedBidderControl();
      control?.markAsTouched();
      fixture.detectChanges();

      expect(component.hasError).toBe(true);
    });

    it('should return false when control is invalid but not touched', async () => {
      const { component, fixture } = await setup();

      const control = component.selectedBidderControl();
      control?.markAsUntouched();
      fixture.detectChanges();

      expect(component.hasError).toBe(false);
    });

    it('should return false when control is null', async () => {
      const { component } = await setup({ form: null as any });

      expect(component.hasError).toBe(false);
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

      expect(screen.getByText('Bidder Information')).toBeInTheDocument();
    });

    it('should render header labels', async () => {
      await setup();

      expect(screen.getByText('Successful Bidder Name')).toBeInTheDocument();
      expect(screen.getByText('Nationality')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
    });

    it('should not render content when no participants', async () => {
      await setup({ participants: [] });

      expect(
        screen.queryByText('Successful Bidder Name')
      ).not.toBeInTheDocument();
    });

    it('should render all participants', async () => {
      await setup();

      expect(screen.getByDisplayValue('Company A')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Company B')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Company C')).toBeInTheDocument();
    });

    it('should render participant nationalities', async () => {
      await setup();

      expect(screen.getByDisplayValue('Argentina')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Brazil')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Colombia')).toBeInTheDocument();
    });

    it('should render participant types', async () => {
      await setup();

      expect(screen.getByDisplayValue('Corporation')).toBeInTheDocument();
      expect(screen.getByDisplayValue('LLC')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Partnership')).toBeInTheDocument();
    });

    it('should render radio buttons for each participant', async () => {
      await setup();

      const radioButtons = document.querySelectorAll('mat-radio-button');
      expect(radioButtons.length).toBe(3);
    });

    it('should render detail buttons for each participant', async () => {
      await setup();

      const detailButtons = document.querySelectorAll(
        'button[mat-icon-button]'
      );
      expect(detailButtons.length).toBe(3);
    });

    it('should render more_vert icons', async () => {
      await setup();

      const icons = Array.from(document.querySelectorAll('mat-icon')).filter(
        (icon) => icon.textContent?.trim() === 'more_vert'
      );
      expect(icons.length).toBe(3);
    });

    it('should disable input fields', async () => {
      await setup();

      const inputs = document.querySelectorAll('input[matInput]');
      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });
    });
  });

  describe('Error display', () => {
    it('should not show error initially', async () => {
      await setup();

      expect(
        screen.queryByText('Please select a bidder')
      ).not.toBeInTheDocument();
    });

    it('should not show error when control is valid', async () => {
      const { component, fixture } = await setup();

      const control = component.selectedBidderControl();
      control?.setValue('bidder-1');
      control?.markAsTouched();
      fixture.detectChanges();

      expect(
        screen.queryByText('Please select a bidder')
      ).not.toBeInTheDocument();
    });
  });

  describe('Radio group interaction', () => {
    it('should update form control when radio button is selected', async () => {
      const { component, fixture } = await setup();

      const control = component.selectedBidderControl();
      control?.setValue('bidder-2');
      fixture.detectChanges();

      expect(control?.value).toBe('bidder-2');
    });
  });

  describe('Button accessibility', () => {
    it('should have aria-label for detail buttons', async () => {
      await setup();

      const button = document.querySelector(
        'button[aria-label*="Ver detalles"]'
      );
      expect(button).toBeInTheDocument();
      expect(button?.getAttribute('aria-label')).toContain('Company A');
    });

    it('should have correct aria-labels for all buttons', async () => {
      await setup();

      const buttons = document.querySelectorAll(
        'button[aria-label*="Ver detalles"]'
      );
      expect(buttons.length).toBe(3);
      expect(buttons[0].getAttribute('aria-label')).toBe(
        'Ver detalles de Company A'
      );
      expect(buttons[1].getAttribute('aria-label')).toBe(
        'Ver detalles de Company B'
      );
      expect(buttons[2].getAttribute('aria-label')).toBe(
        'Ver detalles de Company C'
      );
    });
  });

  describe('Layout structure', () => {
    it('should have header group with correct classes', async () => {
      await setup();

      const headerGroup = document.querySelector('.o-header-group');
      expect(headerGroup).toBeInTheDocument();
      expect(headerGroup?.classList.contains('row')).toBe(true);
    });

    it('should have header items', async () => {
      await setup();

      const headerItems = document.querySelectorAll('.o-header-group__item');
      expect(headerItems.length).toBe(3);
    });

    it('should have bidder rows', async () => {
      await setup();

      const bidderRows = document.querySelectorAll('.bidderRow');
      expect(bidderRows.length).toBe(3);
    });

    it('should have correct structure for bidder items', async () => {
      await setup();

      const bidderItems = document.querySelectorAll('.bidderRow__items');
      expect(bidderItems.length).toBeGreaterThan(0);
    });

    it('should have button container for each row', async () => {
      await setup();

      const buttonContainers = document.querySelectorAll('.bidderRow__btn');
      expect(buttonContainers.length).toBe(3);
    });
  });

  describe('Form control integration', () => {
    it('should bind form control to radio group', async () => {
      const { component, fixture } = await setup();

      const control = component.selectedBidderControl();
      expect(control).toBeDefined();

      control?.setValue('bidder-1');
      fixture.detectChanges();

      expect(control?.value).toBe('bidder-1');
    });

    it('should validate required field', async () => {
      const { component, fixture } = await setup();

      const control = component.selectedBidderControl();
      fixture.detectChanges();

      expect(control?.hasError('required')).toBe(true);

      control?.setValue('bidder-1');
      fixture.detectChanges();

      expect(control?.hasError('required')).toBe(false);
    });
  });

  describe('Signal reactivity', () => {
    it('should update view when participants signal changes', async () => {
      const { component, fixture } = await setup();

      expect(screen.getByDisplayValue('Company A')).toBeInTheDocument();

      const newParticipants = [mockParticipants[0]];
      component.participantsSignal.set(newParticipants);
      fixture.detectChanges();

      expect(screen.getByDisplayValue('Company A')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Company B')).not.toBeInTheDocument();
    });

    it('should recompute hasParticipants when signal changes', async () => {
      const { component, fixture } = await setup();

      expect(component.hasParticipants()).toBe(true);

      component.participantsSignal.set([]);
      fixture.detectChanges();

      expect(component.hasParticipants()).toBe(false);
    });
  });

  describe('Empty state', () => {
    it('should handle empty participants array gracefully', async () => {
      const { component } = await setup({ participants: [] });

      expect(component.participantsSignal()).toEqual([]);
      expect(component.hasParticipants()).toBe(false);
    });

    it('should not render radio group when no participants', async () => {
      await setup({ participants: [] });

      const radioGroup = document.querySelector('mat-radio-group');
      expect(radioGroup).not.toBeInTheDocument();
    });
  });
});
