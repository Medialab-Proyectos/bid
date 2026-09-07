import { UntypedFormGroup } from '@angular/forms';
import { BaseConfig } from '@core/models';

/**
 * Merge 2 configs, first config has higher priority
 * @param baseConfig first config will be used as default
 * @param newConfig second config
 * @returns
 */
export function mergeConfig<T, V>(
  baseConfig: BaseConfig<T, V>,
  newConfig: BaseConfig<T, V>
): BaseConfig<T, V> {
  const mergedConfig = { ...baseConfig };
  mergedConfig.data = { ...mergedConfig.data, ...newConfig.data };
  mergedConfig.settings = {
    ...mergedConfig.settings,
    ...newConfig.settings,
  };
  return mergedConfig;
}

export function removeValidators(form: UntypedFormGroup): void {
  for (const key in form.controls) {
    form.get(key).clearValidators();
    form.get(key).updateValueAndValidity();
  }
}
