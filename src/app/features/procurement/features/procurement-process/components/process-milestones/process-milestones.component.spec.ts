import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { ProcessMilestonesComponent } from './process-milestones.component';
import { Milestones, createMilestones } from '../../procurement-process.form';
import { UntypedFormArray } from '@angular/forms';
import { BiddingProcurementProcessSupervisionMethods } from '@core/enums';

describe('ProcessMilestonesComponent', () => {
  async function setup() {
    const { fixture } = await render(ProcessMilestonesComponent, {
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [provideWindowSizeMock()],
      declarations: [ProcessMilestonesComponent],
    });
    const component = fixture.debugElement.componentInstance;
    return { fixture, component };
  }

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  describe('checkPreviusDates', () => {
    it('should set visibilityMilestonesWarning to true and set errors when dates are not ordered', async () => {
      const { component } = await setup();
      const form = Milestones();
      const newMilestone1 = createMilestones();
      const newMilestone2 = createMilestones();
      const newMilestone3 = createMilestones();
      newMilestone1.controls.initialEstimationDate.setValue(
        new Date(2023, 6, 1)
      );
      newMilestone2.controls.initialEstimationDate.setValue(
        new Date(2023, 6, 3)
      );
      newMilestone3.controls.initialEstimationDate.setValue(
        new Date(2023, 6, 2)
      );
      (form.get('milestoneCollection') as UntypedFormArray).push(newMilestone1);
      (form.get('milestoneCollection') as UntypedFormArray).push(newMilestone2);
      (form.get('milestoneCollection') as UntypedFormArray).push(newMilestone3);

      component.form = form;

      component.checkPreviusDates(2);

      expect(component.visibilityMilestonesWarning).toBe(true);
      expect(component.milestoneCollection.errors).toEqual({
        notOrdered: true,
      });
    });

    it('should set visibilityMilestonesWarning to false and clear errors when dates are ordered', async () => {
      const { component } = await setup();
      const form = Milestones();
      const newMilestone1 = createMilestones();
      const newMilestone2 = createMilestones();
      const newMilestone3 = createMilestones();
      newMilestone1.controls.initialEstimationDate.setValue(
        new Date(2023, 6, 1)
      );
      newMilestone2.controls.initialEstimationDate.setValue(
        new Date(2023, 6, 2)
      );
      newMilestone3.controls.initialEstimationDate.setValue(
        new Date(2023, 6, 3)
      );
      (form.get('milestoneCollection') as UntypedFormArray).push(newMilestone1);
      (form.get('milestoneCollection') as UntypedFormArray).push(newMilestone2);
      (form.get('milestoneCollection') as UntypedFormArray).push(newMilestone3);

      component.form = form;

      component.checkPreviusDates(2);

      expect(component.visibilityMilestonesWarning).toBe(false);
      expect(component.milestoneCollection.errors).toBeNull();
    });
  });

  describe('checkPosteriorDates', () => {
    it('should set visibilityMilestonesWarning to true and set errors when dates are not ordered', async () => {
      const { component } = await setup();
      const form = Milestones();
      const newMilestone1 = createMilestones();
      const newMilestone2 = createMilestones();
      const newMilestone3 = createMilestones();
      newMilestone1.controls.initialEstimationDate.setValue(
        new Date(2023, 6, 1)
      );
      newMilestone2.controls.initialEstimationDate.setValue(
        new Date(2023, 6, 3)
      );
      newMilestone3.controls.initialEstimationDate.setValue(
        new Date(2023, 6, 2)
      );
      (form.get('milestoneCollection') as UntypedFormArray).push(newMilestone1);
      (form.get('milestoneCollection') as UntypedFormArray).push(newMilestone2);
      (form.get('milestoneCollection') as UntypedFormArray).push(newMilestone3);

      component.form = form;

      component.checkPosteriorDates(0);

      expect(component.visibilityMilestonesWarning).toBe(true);
      expect(component.milestoneCollection.errors).toEqual({
        notOrdered: true,
      });
    });

    it('should set visibilityMilestonesWarning to false and clear errors when dates are ordered', async () => {
      const { component } = await setup();
      const form = Milestones();
      const newMilestone1 = createMilestones();
      const newMilestone2 = createMilestones();
      const newMilestone3 = createMilestones();
      newMilestone1.controls.initialEstimationDate.setValue(
        new Date(2023, 6, 1)
      );
      newMilestone2.controls.initialEstimationDate.setValue(
        new Date(2023, 6, 2)
      );
      newMilestone3.controls.initialEstimationDate.setValue(
        new Date(2023, 6, 3)
      );
      (form.get('milestoneCollection') as UntypedFormArray).push(newMilestone1);
      (form.get('milestoneCollection') as UntypedFormArray).push(newMilestone2);
      (form.get('milestoneCollection') as UntypedFormArray).push(newMilestone3);

      component.form = form;

      component.checkPosteriorDates(0);

      expect(component.visibilityMilestonesWarning).toBe(false);
      expect(component.milestoneCollection.errors).toBeNull();
    });
  });

  describe('isDateLowerToday', () => {
    it('should return true if the date is lower than today', async () => {
      const { component } = await setup();

      const currentDate = new Date(2023, 6, 1);

      const form = Milestones();
      const newMilestone1 = createMilestones();
      const newMilestone2 = createMilestones();
      newMilestone1.controls.initialEstimationDate.setValue(
        new Date(2023, 5, 30)
      );
      newMilestone2.controls.initialEstimationDate.setValue(
        new Date(2023, 5, 29)
      );

      (form.get('milestoneCollection') as UntypedFormArray).push(newMilestone1);
      (form.get('milestoneCollection') as UntypedFormArray).push(newMilestone2);

      component.form = form;
      component.currentDate = currentDate;

      const result = component.isDateLowerToday(0);

      expect(result).toBe(true);
    });

    it('should return false if the date is not lower than today', async () => {
      const { component } = await setup();

      const currentDate = new Date(2023, 6, 1);

      const form = Milestones();
      const newMilestone1 = createMilestones();
      const newMilestone2 = createMilestones();
      newMilestone1.controls.initialEstimationDate.setValue(
        new Date(2023, 6, 2)
      );
      newMilestone2.controls.initialEstimationDate.setValue(
        new Date(2023, 6, 3)
      );

      (form.get('milestoneCollection') as UntypedFormArray).push(newMilestone1);
      (form.get('milestoneCollection') as UntypedFormArray).push(newMilestone2);

      component.form = form;
      component.currentDate = currentDate;

      const result = component.isDateLowerToday(0);

      expect(result).toBe(false);
    });
  });

  describe('checkAllDates', () => {
    it('should set errors for disordered dates', async () => {
      const { component } = await setup();

      const form = Milestones();
      const newMilestone1 = createMilestones();
      const newMilestone2 = createMilestones();
      const newMilestone3 = createMilestones();
      const newMilestone4 = createMilestones();

      newMilestone1.controls.initialEstimationDate.setValue(
        new Date(2022, 5, 1)
      );
      newMilestone2.controls.initialEstimationDate.setValue(
        new Date(2022, 5, 2)
      );
      newMilestone3.controls.initialEstimationDate.setValue(
        new Date(2022, 5, 3)
      );
      newMilestone4.controls.initialEstimationDate.setValue(
        new Date(2022, 5, 2)
      );
      const milestoneCollection = form.get(
        'milestoneCollection'
      ) as UntypedFormArray;
      milestoneCollection.push(newMilestone1);
      milestoneCollection.push(newMilestone2);
      milestoneCollection.push(newMilestone3);
      milestoneCollection.push(newMilestone4);

      component.form = form;

      component.checkAllDates();
      const expectedMilestoneColletion = component.form.get(
        'milestoneCollection'
      ) as UntypedFormArray;

      expect(expectedMilestoneColletion.controls[0].errors).toBeNull();
      expect(expectedMilestoneColletion.controls[1].errors).toBeNull();
      expect(expectedMilestoneColletion.controls[2].errors).toBeNull();
      expect(expectedMilestoneColletion.controls[3].errors).toEqual({
        disordered: true,
      });
    });

    it('should not set errors for ordered dates', async () => {
      const { component } = await setup();

      const form = Milestones();
      const newMilestone1 = createMilestones();
      const newMilestone2 = createMilestones();
      const newMilestone3 = createMilestones();
      const newMilestone4 = createMilestones();

      newMilestone1.controls.initialEstimationDate.setValue(
        new Date(2022, 5, 1)
      );
      newMilestone2.controls.initialEstimationDate.setValue(
        new Date(2022, 5, 2)
      );
      newMilestone3.controls.initialEstimationDate.setValue(
        new Date(2022, 5, 3)
      );
      newMilestone4.controls.initialEstimationDate.setValue(
        new Date(2022, 5, 4)
      );
      const milestoneCollection = form.get(
        'milestoneCollection'
      ) as UntypedFormArray;
      milestoneCollection.push(newMilestone1);
      milestoneCollection.push(newMilestone2);
      milestoneCollection.push(newMilestone3);
      milestoneCollection.push(newMilestone4);

      component.form = form;

      component.checkAllDates();
      const expectedMilestoneColletion = component.form.get(
        'milestoneCollection'
      ) as UntypedFormArray;

      expect(expectedMilestoneColletion.controls[0].errors).toBeNull();
      expect(expectedMilestoneColletion.controls[1].errors).toBeNull();
      expect(expectedMilestoneColletion.controls[2].errors).toBeNull();
      expect(expectedMilestoneColletion.controls[3].errors).toBeNull();
    });
  });

  describe('onChangeMilestoneDate', () => {
    it('should set dateLowerToday error when supervisionMethod is ex ante and date is lower than today', async () => {
      const { component } = await setup();
      const form = Milestones();
      const newMilestone1 = createMilestones();

      newMilestone1.controls.initialEstimationDate.setValue(
        new Date(2022, 5, 1)
      );

      const milestoneCollection = form.get(
        'milestoneCollection'
      ) as UntypedFormArray;
      milestoneCollection.push(newMilestone1);

      component.supervisionMethod =
        BiddingProcurementProcessSupervisionMethods.EX_ANTE;
      component.currentDate = new Date(2022, 5, 3);
      component.form = form;

      component.onChangeMilestoneDate(0);

      const expectedMilestoneColletion = component.form.get(
        'milestoneCollection'
      ) as UntypedFormArray;

      expect(expectedMilestoneColletion.controls[0].errors).toEqual({
        dateLowerToday: true,
      });
    });

    it('should not set dateLowerToday error when supervisionMethod is not ex ante', async () => {
      const { component } = await setup();
      const form = Milestones();
      const newMilestone1 = createMilestones();

      newMilestone1.controls.initialEstimationDate.setValue(
        new Date(2022, 5, 10)
      );

      const milestoneCollection = form.get(
        'milestoneCollection'
      ) as UntypedFormArray;
      milestoneCollection.push(newMilestone1);

      component.supervisionMethod =
        BiddingProcurementProcessSupervisionMethods.EX_ANTE;
      component.currentDate = new Date(2022, 5, 3);
      component.form = form;

      component.onChangeMilestoneDate(0);

      const expectedMilestoneColletion = component.form.get(
        'milestoneCollection'
      ) as UntypedFormArray;

      expect(expectedMilestoneColletion.controls[0].errors).toBeNull();
    });

    it('should not set any error', async () => {
      const { component } = await setup();
      const form = Milestones();
      const newMilestone1 = createMilestones();
      const newMilestone2 = createMilestones();

      newMilestone1.controls.initialEstimationDate.setValue(
        new Date(2022, 5, 10)
      );
      newMilestone2.controls.initialEstimationDate.setValue(
        new Date(2022, 5, 11)
      );

      const milestoneCollection = form.get(
        'milestoneCollection'
      ) as UntypedFormArray;
      milestoneCollection.push(newMilestone1);
      milestoneCollection.push(newMilestone2);

      component.supervisionMethod =
        BiddingProcurementProcessSupervisionMethods.EX_ANTE;
      component.currentDate = new Date(2022, 5, 3);
      component.form = form;

      component.onChangeMilestoneDate(1);

      const expectedMilestoneColletion = component.form.get(
        'milestoneCollection'
      ) as UntypedFormArray;

      expect(expectedMilestoneColletion.controls[0].errors).toBeNull();
      expect(expectedMilestoneColletion.controls[1].errors).toBeNull();
    });
  });
});
