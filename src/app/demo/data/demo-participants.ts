const name = (text: string) => ({ en: text, es: text, fr: text, pt: text });

/**
 * `GET /api/v2/settings/participants`.
 *
 * The process detail screen needs this before it can publish the document
 * packages to the store: `availableResults` is mapped without a null check, so
 * an empty body silently blanks the whole Documents tab.
 *
 * `Score` values: 'O' optional, 'R' required, 'N' not applicable.
 */
export function buildDemoParticipantsSettings(packageCodeId: string) {
  return {
    id: `participants-settings-${packageCodeId || 'default'}`,
    countryCode: 'EC',
    category: 'PROCT_GOODS',
    procurementMethod: 'PROCT_ICB',
    packageCode: packageCodeId,
    text: 'PROCESS_PARTICIPANTS.TABLE.TITLE',
    technicalScore: 'O',
    financialScore: 'O',
    overallScore: 'O',
    awardedAmount: 'O',
    availableResults: [
      { id: 0, code: 'PARTICIPANT', name: name('Participant') },
      { id: 1, code: 'AWARDED', name: name('Awarded') },
      { id: 2, code: 'REJECTED', name: name('Rejected') },
      { id: 3, code: 'FAILEDNEGOTIATION', name: name('Failed Negotiation') },
    ],
  };
}

/**
 * `GET /api/v2/procurement-process/{id}/participants`.
 *
 * `participantsDetail` is read straight into `.map()`, so the key has to be
 * present even when there are no participants yet.
 */
export function buildDemoParticipants(procurementProcessId: string) {
  return { procurementProcessId, participantsDetail: [] };
}
