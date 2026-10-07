import { PotentialProcessStatus } from '../models/financial-plan.model';

/**
 * Colour of the status chip on "Ajustar Plan Financiero"'s own process list --
 * one place, the same way `paymentStatusClass` is payment-record's.
 *
 * `fi-status-label` renders its own `<p [ngClass]="cssClass">` inside its own
 * component view, so a class scoped to this module's own `financial-plan.
 * shared.scss` (view-encapsulated to the host component) never reaches it --
 * these names resolve against the shared, global `c-status-label__*` set in
 * `_component__status-label.scss` instead, the same place `paymentStatusClass`
 * already draws its own classes from.
 */
export function potentialProcessStatusClass(status: PotentialProcessStatus | string): string {
  switch (status) {
    case 'EXECUTION':
      return 'c-status-label__bright-green';
    case 'EVALUATION':
      return 'c-status-label__blue';
    case 'IN_PROCESS':
      return 'c-status-label__orange-yellow';
    default:
      // Waiting: not yet started.
      return 'c-status-label__red';
  }
}
