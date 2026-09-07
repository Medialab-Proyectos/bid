import { Injectable, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Enumerator, Enums } from '@core/models';
import { EnumsStoreService } from '@core/services/store-services';
import { EnumState } from '@core/store';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

@Pipe({
  name: 'translateEnum',
  pure: false,
})
@Injectable()
export class TranslateEnumPipe implements PipeTransform, OnDestroy {
  enumValues: Enumerator[] = [];
  enumType: Enums = null;
  enumCode: number = null;
  prefix = '';
  translation = '';

  updateTranslationSubject = new Subject();

  subscriptions = new Subscription();

  constructor(
    private readonly translate: TranslateService,
    private readonly enumsStore: EnumsStoreService
  ) {
    this.init();
  }

  transform(enumCode: number, enumType: Enums, prefix = String()): string {
    if (enumCode !== null && enumCode !== undefined) {
      this.enumCode = Number(enumCode);
      this.enumType = enumType;
      this.prefix = prefix;
      this.updateTranslation();
    }
    return this.translation;
  }

  init() {
    const subscription = this.enumsStore
      .selectEnums()
      .pipe(
        mergeMap((state) =>
          this.updateTranslationSubject.pipe(map(() => state))
        )
      )
      .subscribe((state) => {
        this.enumValues = this.getEnumeratorsByEnumType(this.enumType, state);
        this.translation = this.translateEnum(
          this.enumCode,
          this.enumValues,
          this.prefix
        );
      });

    this.subscriptions.add(subscription);
  }

  updateTranslation(): void {
    this.updateTranslationSubject.next(this.translation);
  }

  translateEnum(
    code: number,
    enumValues: Enumerator[],
    prefix = String()
  ): string {
    const enumValue = this.getEnumByNumber(code, enumValues);
    let translatedValue = String();
    if (enumValue) {
      translatedValue = this.translate.instant(`${prefix}${enumValue.name}`);
    }
    return translatedValue;
  }

  getEnumByNumber(n: number, enumValues: Enumerator[]): Enumerator {
    return enumValues.find((i) => i.id === n);
  }

  /**
   * Get enums array from state filtered by enum
   * @param enumType
   * @param state
   * @returns enums array
   */
  getEnumeratorsByEnumType(enumType: Enums, state: EnumState): Enumerator[] {
    let enums: Enumerator[] = [];

    const enumerators = state[enumType];
    if (enumerators && Array.isArray(enumerators)) {
      enums = enumerators;
    }

    return enums;
  }

  /**
   * gets id from enum by his name and enum type
   * @param name literal from enum
   * @param enumType enum type
   * @returns id of enum
   */
  getIdByName(name: string, enumType: Enums): number {
    const enumValue = this.enumsStore.enumsObject[enumType]?.find(
      (i) => i.name === name
    );
    return enumValue ? enumValue.id : null;
  }

  getCodeNameById(id: number, enumType: string): string {
    const enumValue = this.enumsStore.enumsObject[enumType]?.find(
      (i) => i.id === id
    );
    return enumValue ? enumValue.name.split('.').pop() : '';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
