const errorPrefix = 'R.CONTRACT.VALIDATION_ERRORS.';

export const RContractsErrorDefinitions = {
  'selectedParticipantId-required': `${errorPrefix}BIDDER_REQUIRED`,
  // General Information Tab
  'contractName-required': `${errorPrefix}GENERAL_INFO_NAME_REQUIRED`,
  'startDate-mustBeAfterSignature': `${errorPrefix}GENERAL_INFO_START_DATE_LOWER_THAN_SIGNATURE`,
  'endDate-mustBeAfterStart': `${errorPrefix}GENERAL_INFO_END_DATE_LOWER_THAN_START`,
  'contractType-required': `${errorPrefix}GENERAL_INFO_TYPE_CONTRACT_REQUIRED`,
  'conflictResolutionMethod-required': `${errorPrefix}GENERAL_INFO_CONFLICT_RESOLUTION_REQUIRED`,
  'applicableLaw-required': `${errorPrefix}GENERAL_INFO_APPLICABLE_LAW_REQUIRED`,
  'signatureDate-required': `${errorPrefix}GENERAL_INFO_SIGNING_DATE_REQUIRED`,
  'startDate-required': `${errorPrefix}GENERAL_INFO_START_DATE_REQUIRED`,
  'endDate-required': `${errorPrefix}GENERAL_INFO_END_DATE_REQUIRED`,
  // Lots Tab
  'x-name-required': `${errorPrefix}LOTS_NUMBER_REQUIRED`,
  'x-amount-required': `${errorPrefix}LOTS_AMOUNT_REQUIRED`,
  'x-currency-required': `${errorPrefix}LOTS_CURRENCY_TYPE_REQUIRED`,
  'x-unit-required': `${errorPrefix}LOTS_UNITS_REQUIRED`,
  'x-amount-currencyTotalMismatch': `${errorPrefix}CURRENCY_TOTAL_MISMATCH`,
  // Guarantees Tab
  'x-guaranteeType-required': `${errorPrefix}GUARANTEE_TYPE_REQUIRED`,
  'x-usdEquivalentAmount-required': `${errorPrefix}GUARANTEE_USD_EQUIVALENT_REQUIRED`,
  'x-startDate-required': `${errorPrefix}GUARANTEE_START_DATE_REQUIRED`,
  'x-endDate-required': `${errorPrefix}GUARANTEE_END_DATE_REQUIRED`,
  'x-liquidatedDamageType-required': `${errorPrefix}ADDITIONAL_INFO__DAMAGE_TYPE_REQUIRED`,
  'x-paymentFrequencyType-required': `${errorPrefix}ADDITIONAL_INFO_DAMAGE_FREQUENCY_REQUIRED`,
  'x-percentage-required': `${errorPrefix}ADDITIONAL_INFO_PERCENTAGE_REQUIRED`,
  'x-maximumPercentage-required': `${errorPrefix}ADDITIONAL_INFO_MAXIMUM_PERCENTAGE_REQUIRED`,
  // Cost Distribution Tab
  'x-localCounterPartAmount-required': `${errorPrefix}COST_DISTRIBUTION_LOCAL_COUNTER_PART_AMOUNT_REQUIRED`,
  'x-component-required': `${errorPrefix}COST_DISTIBUTION_COMPONENT_REQUIRED`,
  'x-output-required': `${errorPrefix}COST_DISTRIBUTION_OUTPUT_REQUIRED`,
  'x-bidAmount-required': `${errorPrefix}COST_DISTRIBUTION_BID_AMOUNT_REQUIRED`,
  'x-cofinancingAmount-required': `${errorPrefix}COST_DISTRIBUTION_CONFINANCING_AMOUNT_REQUIRED`,
  // Execution Place Tab
  'x-address-required': `${errorPrefix}EXECUTION_PLACE_ADDRESS_REQUIRED`,
  'x-country-required': `${errorPrefix}EXECUTION_PLACE_COUNTRY_REQUIRED`,
};
