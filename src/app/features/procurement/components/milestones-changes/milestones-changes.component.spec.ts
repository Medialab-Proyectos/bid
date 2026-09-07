import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MilestonesChangesComponent } from './milestones-changes.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { MilestonesChanges } from '../../models';

const mockMilestones: MilestonesChanges = {
  modifiedMilestone: false,
  newMilestones: [
    {
      actualDate: null,
      codeMilestone: 26,
      estimatedDate: '2023-03-23T18:41:01Z',
      modificationDate: '',
      modifiedBy: '',
      nameMilestone: '',
      reestimatedDate: '2023-02-25T18:00:00Z',
      order: 1,
    },
    {
      actualDate: null,
      codeMilestone: 5,
      estimatedDate: '2023-03-24T18:00:00Z',
      modificationDate: '',
      modifiedBy: '',
      nameMilestone: '',
      reestimatedDate: '2023-02-25T18:50:00Z',
      order: 1,
    },
    {
      actualDate: null,
      codeMilestone: 31,
      estimatedDate: '2023-03-25T18:00:00Z',
      modificationDate: '',
      modifiedBy: '',
      nameMilestone: '',
      reestimatedDate: null,
      order: 1,
    },
    {
      actualDate: null,
      codeMilestone: 0,
      estimatedDate: '2023-03-26T18:00:00Z',
      modificationDate: '',
      modifiedBy: '',
      nameMilestone: '',
      reestimatedDate: '2023-02-25T18:00:00Z',
      order: 1,
    },
    {
      actualDate: null,
      codeMilestone: 11,
      estimatedDate: '2023-08-27T18:00:00Z',
      modificationDate: '',
      modifiedBy: '',
      nameMilestone: '',
      reestimatedDate: '2023-02-25T18:00:00Z',
      order: 1,
    },
  ],
  previousMilestones: [
    {
      actualDate: null,
      codeMilestone: 31,
      estimatedDate: '2023-03-24T22:41:01Z',
      modificationDate: '',
      modifiedBy: '',
      nameMilestone: '',
      reestimatedDate: null,
      order: 1,
    },
    {
      actualDate: null,
      codeMilestone: 26,
      estimatedDate: '2023-03-27T22:00:00Z',
      modificationDate: '',
      modifiedBy: '',
      nameMilestone: '',
      reestimatedDate: null,
      order: 1,
    },
    {
      actualDate: null,
      codeMilestone: 5,
      estimatedDate: '2023-03-28T22:00:00Z',
      modificationDate: '',
      modifiedBy: '',
      nameMilestone: '',
      reestimatedDate: null,
      order: 1,
    },
    {
      actualDate: null,
      codeMilestone: 11,
      estimatedDate: '2023-03-26T22:00:00Z',
      modificationDate: '',
      modifiedBy: '',
      nameMilestone: '',
      reestimatedDate: null,
      order: 1,
    },
    {
      actualDate: null,
      codeMilestone: 0,
      estimatedDate: '2023-03-25T22:00:00Z',
      modificationDate: '',
      modifiedBy: '',
      nameMilestone: '',
      reestimatedDate: null,
      order: 1,
    },
  ],
  updatedBy: 'fiduciaryinterface_bp3',
  updatedDate: '2023-02-27T21:55:08.399Z',
};

describe('MilestonesChangesComponent', () => {
  let component: MilestonesChangesComponent;
  let fixture: ComponentFixture<MilestonesChangesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MilestonesChangesComponent],
      imports: [
        PipeModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MilestonesChangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return the values correctly', () => {
    component.changesMilestones = mockMilestones;
    expect(component.previousMilestonesData).toStrictEqual(
      mockMilestones.previousMilestones
    );
    expect(component.newMilestonesData).toStrictEqual(
      mockMilestones.newMilestones
    );
  });
});
