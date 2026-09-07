import { Injectable } from '@angular/core';
import {
  AppStateWithProcurementContracts,
  ProcurementContractsState,
} from '@core/store';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as actions from '@core/store/procurement-contracts/actions/procurement-contracts.action';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BiddingContractsStoreService {
  constructor(
    private readonly store: Store<AppStateWithProcurementContracts>
  ) {}

  get state$(): Observable<ProcurementContractsState> {
    return this.store.pipe(select('procurementContracts'));
  }

  getContractsByProcess(processId: string) {
    return this.state$.pipe(
      filter((state) => Boolean(state.contractsByProcess[processId])),
      map((state) => state.contractsByProcess[processId])
    );
  }

  getContractsByProcessAction(processId: string, processCode: string): void {
    this.store.dispatch(actions.getContracts({ processId, processCode }));
  }

  deleteContractAction(
    processId: string,
    contractId: string,
    isCopy: boolean
  ): void {
    this.store.dispatch(
      actions.deleteContract({ processId, contractId, isCopy })
    );
  }

  terminateContractAction(
    processId: string,
    contractId: string,
    lang: string
  ): void {
    this.store.dispatch(
      actions.terminateContract({ processId, contractId, lang })
    );
  }

  completeContractAction(
    processId: string,
    contractId: string,
    lang: string
  ): void {
    this.store.dispatch(
      actions.completeContract({ processId, contractId, lang })
    );
  }
}
