import { Component, Input, inject, signal, computed } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ParticipantAwarded } from '@core/models';
import { FormType } from '@core/utils';
import { ContractParticipants } from '../../rebrand-form/models';
import { RContractsBidderComponent } from '../r-contracts-bidder/r-contracts-bidder.component';

export interface BidderDetailDialog {
  headerIcon?: string;
  headerText: string;
  bodyText: string;
  bidderInfo: ParticipantAwarded;
  confirmBtnText: string;
  cancelBtnText: string;
}

@Component({
  selector: 'fi-r-contracts-detail-bidder',
  templateUrl: './r-contracts-detail-bidder.component.html',
  styleUrls: ['./r-contracts-detail-bidder.component.scss'],
})
export class RContractsDetailBidderComponent {
  private readonly dialog = inject(MatDialog);

  participantsSignal = signal<ParticipantAwarded[]>([]);
  private formSignal = signal<FormType<ContractParticipants> | null>(null);
  @Input() set participants(value: ParticipantAwarded[]) {
    this.participantsSignal.set(value || []);
  }

  @Input() set form(value: FormType<ContractParticipants>) {
    this.formSignal.set(value || null);
  }

  selectedBidderControl = computed(
    () => this.formSignal()?.controls?.selectedParticipantId
  );

  hasParticipants = computed(
    () => (this.participantsSignal()?.length ?? 0) > 0
  );

  get hasError(): boolean {
    const control = this.selectedBidderControl();
    return !!(control?.invalid && control?.touched);
  }

  openDetails(bidder: ParticipantAwarded): void {
    const dialogData: BidderDetailDialog = {
      headerIcon: 'info',
      headerText: 'Detalle del Adjudicatario',
      bodyText: 'Información detallada del participante',
      bidderInfo: bidder,
      cancelBtnText: 'Cancelar',
      confirmBtnText: 'Aceptar',
    };

    this.dialog.open(RContractsBidderComponent, {
      data: dialogData,
      width: 'auto',
      maxHeight: '65vh',
      maxWidth: '90vw',
    });
  }
}
