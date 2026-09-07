const entry = (id: number, name: string) => ({
  id,
  nameEn: name,
  nameEs: name,
  nameFr: name,
  namePt: name,
});

/**
 * `GET /api/v3/bidding-contracts/enums/{code}`.
 *
 * Keys are the `ContractsEnum` path segments. These lists feed the dropdowns
 * of the contract forms, so an unknown code answers with an empty list rather
 * than failing.
 */
const CONTRACT_ENUMS: { [code: string]: Array<{ id: number; name: string }> } =
  {
    'contract-types': [
      { id: 1, name: 'Lump sum' },
      { id: 2, name: 'Unit price' },
      { id: 3, name: 'Time based' },
      { id: 4, name: 'Percentage' },
    ],
    'contract-status': [
      { id: 1, name: 'Pending signature' },
      { id: 2, name: 'Signed' },
      { id: 3, name: 'Under execution' },
      { id: 4, name: 'Finished' },
      { id: 5, name: 'Terminated' },
    ],
    'bonus-types': [
      { id: 1, name: 'Fixed bonus' },
      { id: 2, name: 'Variable bonus' },
    ],
    'conflict-resolution-method-types': [
      { id: 1, name: 'Arbitration' },
      { id: 2, name: 'Dispute boards' },
      { id: 3, name: 'Does not apply' },
    ],
    'guarantee-types': [
      { id: 1, name: 'Performance guarantee' },
      { id: 2, name: 'Advance payment guarantee' },
      { id: 3, name: 'Bid security' },
    ],
    'liquidation-of-damage-types': [
      { id: 1, name: 'Conventional penalties and fines' },
      { id: 2, name: 'Other provisions' },
    ],
    'payment-distribution-types': [
      { id: 1, name: 'Milestone based' },
      { id: 2, name: 'Monthly' },
      { id: 3, name: 'Single payment' },
    ],
    'payment-frequency-types': [
      { id: 1, name: 'Monthly' },
      { id: 2, name: 'Quarterly' },
      { id: 3, name: 'On delivery' },
    ],
    'payment-request-types': [
      { id: 1, name: 'Invoice' },
      { id: 2, name: 'Certificate of progress' },
    ],
  };

export function buildDemoContractEnum(code: string) {
  return (CONTRACT_ENUMS[code] ?? []).map((item) => entry(item.id, item.name));
}

/** `GET /api/biddingProcessProcurementProcesses/{id}/biddingContracts`. */
export function buildDemoBiddingContracts() {
  return { biddingContracts: [] };
}
