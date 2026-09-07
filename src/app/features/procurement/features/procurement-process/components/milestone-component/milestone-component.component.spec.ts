import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { BiddingMilestonesSchema } from '@core/models';
import { MilestoneComponentComponent } from './milestone-component.component';
import { render, screen } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';

const mockMilestones: BiddingMilestonesSchema[] = [
  {
    actualDate: null,
    code: 'CHK_MI_SPN',
    id: 'a1a2e8bcdc55415995c45aedc19feb79',
    initialEstimationDate: new Date(),
    reEstimationDate: null,
  },
  {
    actualDate: null,
    code: 'CHK_MI_BD',
    id: '474d1c8932364138b13693c2ab4c3347',
    initialEstimationDate: new Date(),
    reEstimationDate: null,
  },
  {
    actualDate: null,
    code: 'CHK_MI_CS',
    id: '4008b4d02b254a7c981f97aa4761017d',
    initialEstimationDate: new Date(),
    reEstimationDate: null,
  },
  {
    actualDate: null,
    code: 'CHK_MI_EV',
    id: '1444536e37b9415bb35ec94548a30db2',
    initialEstimationDate: new Date(),
    reEstimationDate: null,
  },
  {
    actualDate: null,
    code: 'CHK_MI_POCA',
    id: '30539125dafd4a609bbedd8264e848fb',
    initialEstimationDate: new Date(),
    reEstimationDate: null,
  },
];
describe('MilestoneComponentComponent', () => {
  async function setup() {
    const { fixture } = await render(MilestoneComponentComponent, {
      componentProperties: {
        milestones: mockMilestones,
      },
      providers: [{ provide: 'windowObject', useValue: window }],
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    });
    const component = fixture.debugElement.componentInstance;
    return { component, fixture };
  }

  async function setupMobile() {
    const { fixture } = await render(MilestoneComponentComponent, {
      componentProperties: {
        milestones: mockMilestones,
        mobileView: true,
      },
      providers: [{ provide: 'windowObject', useValue: window }],
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    });
    const component = fixture.debugElement.componentInstance;
    return { component, fixture };
  }

  it('it should show all the milestones', async () => {
    await setup();
    const records = await screen.findAllByTestId('milestoneRole-row');
    expect(records.length).toBe(mockMilestones.length);
  });
  describe('Given im in the mobile resolution', () => {
    it('should show the expanded details on button click', async () => {
      await setupMobile();
      screen.getAllByTestId('btn-seeDetails')[0].click();
      const records = await screen.getAllByTestId('qa-initialDate');
      expect(records.length).toBe(5);
    });
  });
});
