import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import {
  BiddingProcessProcurementProcessStatuses,
  BiddingProcurementProcessSupervisionMethods,
} from '@core/enums';
import { WindowSizeService } from '@core/services/view';
import {
  FormConfig,
  ModeOfProcurementForm,
} from '../../models/form-config.model';
import { Milestones } from '../../procurement-process.form';
import { Subscription } from 'rxjs';

@Component({
  selector: 'fi-process-milestones',
  templateUrl: './process-milestones.component.html',
})
export class ProcessMilestonesComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  private readonly subscription = new Subscription();
  public visibilityMilestonesWarning: boolean;
  public mobileView = false;

  @Input() form: UntypedFormGroup = Milestones();
  @Input() number = 4;
  @Input() readOnly = false;
  @Input() mode: ModeOfProcurementForm;
  @Input() status: BiddingProcessProcurementProcessStatuses;
  @Input() formConfig: FormConfig;
  @Input() milestoneRules = false;

  @Input() supervisionMethod: BiddingProcurementProcessSupervisionMethods;

  UPDATE = ModeOfProcurementForm.UPDATE;
  CREATE = ModeOfProcurementForm.CREATE;
  DRAFT = BiddingProcessProcurementProcessStatuses.DRAFT;

  constructor(private readonly windowSvc: WindowSizeService) {}
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get milestoneCollection() {
    return this.form.get('milestoneCollection') as UntypedFormArray;
  }
  currentDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );
  ngOnInit(): void {
    this.initMobileConditionals();
  }

  checkPreviusDates(index: number): void {
    for (let i = index; i >= 1; i--) {
      const allDatesCompleted = this.milestoneCollection.value.every(
        (item: any) => Boolean(item.initialEstimationDate)
      );
      const prevDate =
        this.milestoneCollection.value[i - 1].initialEstimationDate;
      const actualDate =
        this.milestoneCollection.value[i].initialEstimationDate;
      if (
        this.milestoneRules ? actualDate < prevDate : actualDate <= prevDate
      ) {
        if (
          (this.milestoneRules && allDatesCompleted) ||
          !this.milestoneRules
        ) {
          this.visibilityMilestonesWarning = true;
        }
        this.visibilityMilestonesWarning = true;
        this.milestoneCollection.setErrors({
          notOrdered: true,
        });
        return;
      } else {
        this.visibilityMilestonesWarning = false;
        this.milestoneCollection.setErrors(null);
      }
    }
  }

  checkPosteriorDates(index: number): void {
    const length = this.milestoneCollection.value.length - 1;
    for (let i = index; i < length; i++) {
      const allDatesCompleted = this.milestoneCollection.value.every(
        (item: any) => Boolean(item.initialEstimationDate)
      );
      const nextDate =
        this.milestoneCollection.value[i + 1].initialEstimationDate;
      const actualDate =
        this.milestoneCollection.value[i].initialEstimationDate;
      if (nextDate !== '') {
        if (
          this.milestoneRules ? actualDate > nextDate : actualDate >= nextDate
        ) {
          if (
            (this.milestoneRules && allDatesCompleted) ||
            !this.milestoneRules
          ) {
            this.visibilityMilestonesWarning = true;
          }
          this.milestoneCollection.setErrors({
            notOrdered: true,
          });
          return;
        } else {
          this.visibilityMilestonesWarning = false;
          this.milestoneCollection.setErrors(null);
        }
      }
    }
  }

  isDateLowerToday(milestonesIndex: number): boolean {
    const controlDate = new Date(
      this.milestoneCollection.controls[
        milestonesIndex
      ].value.initialEstimationDate
    );
    if (controlDate < this.currentDate) {
      return true;
    }
    return false;
  }

  onChangeMilestoneDate(milestonesIndex: number): void {
    if (
      this.supervisionMethod ===
        BiddingProcurementProcessSupervisionMethods.EX_ANTE &&
      this.isDateLowerToday(milestonesIndex)
    ) {
      this.milestoneCollection.controls[milestonesIndex].setErrors({
        dateLowerToday: true,
      });
    } else {
      this.milestoneCollection.controls[milestonesIndex].setErrors(null);
    }
    if (milestonesIndex >= 1) {
      this.checkPreviusDates(milestonesIndex);
      if (!this.visibilityMilestonesWarning) {
        this.checkPosteriorDates(milestonesIndex);
      }
    } else {
      this.checkPosteriorDates(milestonesIndex);
    }
    this.checkAllDates();
  }

  getMilestoneValue(index: number): Date {
    return new Date(
      new Date(
        this.milestoneCollection.at(index).get('initialEstimationDate').value
      ).toDateString()
    );
  }

  checkAllDates() {
    for (let i = 0; i < this.milestoneCollection.length + 1; i++) {
      if (i < this.milestoneCollection.length - 1) {
        const actualDate = this.getMilestoneValue(i);
        const nextDate = this.getMilestoneValue(i + 1);
        if (nextDate === null) {
          return;
        } else {
          for (let j = i + 1; j < this.milestoneCollection.length; j++) {
            const newNextDate = this.getMilestoneValue(j);
            if (
              this.milestoneRules
                ? newNextDate < actualDate
                : newNextDate <= actualDate
            ) {
              this.milestoneCollection.at(j).setErrors({ disordered: true });
            } else {
              this.milestoneCollection.at(j).setErrors(null);
            }
          }
        }
      }
    }
    this.form.updateValueAndValidity();
  }

  initMobileConditionals(): void {
    this.subscription.add(
      this.windowSvc.windowSizeChanged.subscribe((data) => {
        this.mobileView = data.mobileView;
      })
    );
  }

  ngAfterViewInit(): void {
    this.checkAllDates();
  }
}