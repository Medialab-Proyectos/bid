import { Injectable } from '@angular/core';
import { GroupMethodEnum, SettingType } from '@core/enums';
import { KeyValueInput } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class AppUtilsService {
  buildAttributesArray(
    type: SettingType,
    attributeCountry: KeyValueInput,
    attributeCategory: KeyValueInput,
    attributeProcurementMethod?: KeyValueInput,
    attributeGroupMethod?: KeyValueInput,
    attributeSupervisionMethod?: KeyValueInput,
    attributeExpired?: KeyValueInput,
    attributePackageCode?: KeyValueInput,
    attributeDocumentCode?: KeyValueInput,
    attributeDifferentiator?: KeyValueInput
  ): KeyValueInput[] {
    const attributtes: KeyValueInput[] = [];
    switch (type) {
      case SettingType.Method:
        attributtes.push(attributeCountry);
        attributtes.push(attributeCategory);
        attributtes.push(attributeProcurementMethod);
        attributtes.push(attributeSupervisionMethod);
        if (attributeExpired !== null) {
          attributtes.push(attributeExpired);
        }
        break;
      case SettingType.GroupMethod:
        break;
      case SettingType.procurementMethod:
        attributtes.push(attributeCountry);
        attributtes.push(attributeCategory);
        attributtes.push(attributeDifferentiator);
        break;
      case SettingType.Threshold:
        if (
          attributeGroupMethod &&
          attributeGroupMethod.value !== GroupMethodEnum.NationalSystem
        ) {
          attributtes.push(attributeCountry);
          attributtes.push(attributeGroupMethod);
          attributtes.push(attributeCategory);
          attributtes.push(attributeSupervisionMethod);
        } else {
          attributtes.push(attributeCountry);
          attributtes.push(attributeGroupMethod);
          attributtes.push(attributeProcurementMethod);
          attributtes.push(attributeCategory);
          attributtes.push(attributeSupervisionMethod);
        }
        break;
      case SettingType.Milestone:
        attributtes.push(attributeCategory);
        attributtes.push(attributeProcurementMethod);
        attributtes.push(attributeSupervisionMethod);
        break;
      case SettingType.MandatoryField:
        attributtes.push(attributeCountry);
        attributtes.push(attributeCategory);
        attributtes.push(attributeProcurementMethod);
        attributtes.push(attributeSupervisionMethod);
        break;
      case SettingType.ParticipantFields:
        attributtes.push(attributeCountry);
        attributtes.push(attributeCategory);
        attributtes.push(attributeProcurementMethod);
        attributtes.push(attributePackageCode);
        break;
      case SettingType.supervisionMethod:
        attributtes.push(attributeCountry);
        attributtes.push(attributeCategory);
        attributtes.push(attributeProcurementMethod);
        break;
      case SettingType.ResultOptions:
        attributtes.push(attributeCategory);
        attributtes.push(attributeProcurementMethod);
        attributtes.push(attributeSupervisionMethod);
        attributtes.push(attributePackageCode);
        attributtes.push(attributeDocumentCode);
        break;
      case SettingType.AdditionalDocumentPackage:
        attributtes.push(attributeCategory);
        attributtes.push(attributeProcurementMethod);
        attributtes.push(attributeSupervisionMethod);
        break;
      default:
    }
    return attributtes;
  }
}
