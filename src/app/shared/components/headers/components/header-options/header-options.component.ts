import {
  Component,
  Input,
  HostListener,
  ViewChild,
  ElementRef,
  OnDestroy,
  OnChanges,
} from '@angular/core';
import { User } from '@core/models/userInfo.model';
import { Align, Offset } from '@progress/kendo-angular-popup';
import { Store } from '@ngrx/store';
import { AppStateWithContact } from '@core/store';
import { AppStateWithUsrPreferences } from '@core/store/preferences/reducers/preferences.reducer';
import { Subscription } from 'rxjs';
import { SettingsModel } from '@core/models';
import { environment } from '@fiduciary-interface/environments/environment';

@Component({
  selector: 'fi-header-options',
  templateUrl: './header-options.component.html',
})
export class HeaderOptionsComponent implements OnChanges, OnDestroy {
  @Input() userInfo: User;
  public anchorAlign: Align = { horizontal: 'right', vertical: 'bottom' };
  public popupAlign: Align = { horizontal: 'right', vertical: 'top' };
  public expandedOptions = false;

  public translationsObject: unknown;
  public usrPreferences: Array<SettingsModel>;
  public newUsrPreferences: Array<SettingsModel>;
  public selectedLang: string;

  public userName: string;

  public contactId: string;
  readonly suscriptionsCollection: Subscription[] = [];
  public offset: Offset = { left: 1215, top: 75 };
  loadedTranslation: boolean;

  clientPortalUrl: string = environment.clientsConnectivityPortalUrl;
  helpSupportUrl: string = environment.helpSupportUrl;

  constructor(
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    readonly storeContact: Store<AppStateWithContact>
  ) {
    this.suscriptionsCollection.push(
      this.storeContact.select('contact').subscribe((data) => {
        this.contactId = data.contact?.contactId;
      })
    );
  }

  @ViewChild('anchor') public anchor: ElementRef;
  @ViewChild('popup', { read: ElementRef }) public popup: ElementRef;

  @HostListener('document:click', ['$event'])
  public documentClick(event: any): void {
    if (!this.contains(event.target)) {
      this.expandedOptions = false;
    }
  }

  ngOnChanges(): void {
    this.getUsrName();
  }

  ngOnDestroy(): void {
    this.suscriptionsCollection.forEach((el) => {
      el.unsubscribe();
    });
  }

  navigateToClientPortal(): void {
    window.open(this.clientPortalUrl, '_blank', 'noopener,noreferrer');
  }

  navigateToHelpSupport(): void {
    window.open(this.helpSupportUrl, '_blank', 'noopener,noreferrer');
  }

  getUsrName(): void {
    this.userName = this.userInfo?.email;
  }

  private contains(target: any): boolean {
    return (
      this.anchor.nativeElement.contains(target) ||
      (this.popup ? this.popup.nativeElement.contains(target) : false)
    );
  }

  toggle(): void {
    this.expandedOptions = !this.expandedOptions;
  }
}
