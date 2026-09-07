import { Injectable, Injector } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { EnumsStoreService } from '@core/services/store-services';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ParticipantsService {
  nationalityValue: string;
  private readonly bidderFormBH: BehaviorSubject<UntypedFormGroup>;
  private enumStoreSvc: EnumsStoreService;

  constructor(
    private readonly translate: TranslateService,
    private readonly injector: Injector
  ) {
    this.bidderFormBH = new BehaviorSubject<UntypedFormGroup>(null);
  }

  /**
   * Obtiene EnumsStoreService de forma lazy
   */
  private getEnumsStoreService(): EnumsStoreService {
    if (!this.enumStoreSvc) {
      this.enumStoreSvc = this.injector.get(EnumsStoreService);
    }
    return this.enumStoreSvc;
  }

  /**
   * Matches the nationalitieCode with the enum to translate it
   * @param nationalitieCode
   * @returns nationality string
   */
  setNationalities(nationalitieCode: number): string {
    this.getEnumsStoreService()
      .selectEnums()
      .subscribe((data) => {
        this.nationalityValue = data?.memberCountries.find(
          (nationality) => nationality.id === nationalitieCode
        )?.name;
      });

    return this.translate.instant(this.nationalityValue);
  }

  setBidderForm(form: UntypedFormGroup): void {
    this.bidderFormBH.next(form);
  }

  getBidderForm$(): Observable<UntypedFormGroup> {
    return this.bidderFormBH.asObservable();
  }
}
