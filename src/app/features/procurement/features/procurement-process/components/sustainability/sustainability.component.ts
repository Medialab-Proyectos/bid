import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Enumerator } from '@core/models';
import { EnumsStoreService } from '@core/services/store-services';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { sustainabilityForm } from '../../procurement-process.form';

@Component({
  selector: 'fi-sustainability',
  templateUrl: './sustainability.component.html',
})
export class SustainabilityComponent implements OnInit {
  @Input() number: number;
  @Input() form: UntypedFormGroup = sustainabilityForm();
  @Input() isPROCT_PFA: boolean;
  public sustainabilitiesData$: Observable<Enumerator[]>;

  constructor(private readonly enumsSvc: EnumsStoreService) {}

  ngOnInit(): void {
    this.sustainabilitiesData$ = this.getSustainabilityEnum();
  }

  getSustainabilityEnum(): Observable<Enumerator[]> {
    return this.enumsSvc
      .selectEnums()
      .pipe(
        map((data) => data.biddingProcessProcurementProcessSustainabilities)
      );
  }
}
