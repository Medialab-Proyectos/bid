import { BaseConfig } from '@core/models';
import { mergeConfig } from './forms.utils';

describe('Forms utils', () => {
  it('should merge 2 configs', () => {
    const config1: BaseConfig<TestData, TestSettings> = {
      data: {
        id: '1',
        name: 'test',
      },
      settings: { isDisabled: false },
    };
    const config2: BaseConfig<TestData, TestSettings> = {
      data: {
        id: '2',
      },
      settings: { isDisabled: true },
    };
    const result = mergeConfig(config1, config2);

    expect(result).toEqual({
      data: {
        id: '2',
        name: 'test',
      },
      settings: { isDisabled: true },
    });
  });
});

interface TestData {
  id?: string;
  name?: string;
}

interface TestSettings {
  isDisabled?: boolean;
}
