import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '@progress/kendo-angular-l10n';
import { Store } from '@ngrx/store';
import { AppStateWithUsrPreferences } from '@core/store';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';

@Injectable({
  providedIn: 'root',
})
export class KendoKeysMessageService extends MessageService {
  private localeId = 'es';
  localesIDs = ['fr', 'pt', 'es', 'en'];
  data = {
    es: {
      rtl: true,
      messages: {
        'kendo.grid.noRecords': 'No hay datos disponibles.',
        'kendo.grid.columnsReset': 'Restablecer',
        'kendo.grid.columnsApply': 'Aplicar',
        'kendo.grid.columns': 'Columnas',
        'kendo.grid.groupPanelEmpty': 'Arrastra aquí una cabecera de columna para agrupar',
        'kendo.grid.filter': 'Filtrar',
        'kendo.upload.select': 'Seleccionar archivo',
        'kendo.upload.dropFilesHere': 'o arrastra el archivo hasta aquí',
        'kendo.upload.remove': 'Quitar',
        'kendo.upload.clearSelectedFiles': 'Quitar archivo',
        'kendo.upload.invalidFileExtension': 'Formato de archivo no admitido',
        'kendo.upload.invalidMaxFileSize': 'El archivo supera el tamaño máximo',
      },
    },
    en: {
      rtl: true,
      messages: {
        'kendo.grid.noRecords': 'No data available',
        'kendo.grid.columnsReset': 'Reset',
        'kendo.grid.columnsApply': 'Apply',
        'kendo.grid.columns': 'Columns',
        'kendo.grid.groupPanelEmpty': 'Drag a column header here to group by it',
        'kendo.grid.filter': 'Filter',
        'kendo.upload.select': 'Select file',
        'kendo.upload.dropFilesHere': 'or drag the file here',
        'kendo.upload.remove': 'Remove',
        'kendo.upload.clearSelectedFiles': 'Remove file',
        'kendo.upload.invalidFileExtension': 'File format not accepted',
        'kendo.upload.invalidMaxFileSize': 'The file is over the size limit',
      },
    },
    pt: {
      rtl: true,
      messages: {
        'kendo.grid.noRecords': 'Nenhum dado disponível.',
        'kendo.grid.columnsReset': 'Reiniciar',
        'kendo.grid.columnsApply': 'Aplicar',
        'kendo.grid.columns': 'Colunas',
        'kendo.grid.groupPanelEmpty': 'Arraste aqui um cabeçalho de coluna para agrupar',
        'kendo.grid.filter': 'Filtrar',
        'kendo.upload.select': 'Selecionar ficheiro',
        'kendo.upload.dropFilesHere': 'ou arraste o ficheiro até aqui',
        'kendo.upload.remove': 'Remover',
        'kendo.upload.clearSelectedFiles': 'Remover ficheiro',
        'kendo.upload.invalidFileExtension': 'Formato de ficheiro não aceite',
        'kendo.upload.invalidMaxFileSize': 'O ficheiro excede o tamanho máximo',
      },
    },
    fr: {
      rtl: true,
      messages: {
        'kendo.grid.noRecords': 'Pas de données disponibles.',
        'kendo.grid.columnsReset': 'Réinitialiser',
        'kendo.grid.columnsApply': 'Appliquer',
        'kendo.grid.columns': 'Colonnes',
        'kendo.grid.groupPanelEmpty': 'Glissez ici un en-tête de colonne pour regrouper',
        'kendo.grid.filter': 'Filtrer',
        'kendo.upload.select': 'Sélectionner un fichier',
        'kendo.upload.dropFilesHere': 'ou glissez le fichier ici',
        'kendo.upload.remove': 'Retirer',
        'kendo.upload.clearSelectedFiles': 'Retirer le fichier',
        'kendo.upload.invalidFileExtension': 'Format de fichier non accepté',
        'kendo.upload.invalidMaxFileSize': 'Le fichier dépasse la taille maximale',
      },
    },
  };

  constructor(
    private readonly translate: TranslateService,
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    public intlService: IntlService
  ) {
    super();
    this.storePreferences.select('preferences').subscribe((data) => {
      if (data && data.preferences?.preferredLanguage) {
        const locale = this.localesIDs.find((l) =>
          l.includes(data.preferences?.preferredLanguage)
        );
        this.localeId = locale;
        (this.intlService as CldrIntlService).localeId = locale;
      }
    });
  }

  translateKey(key: string): string {
    return this.translate.instant(key);
  }

  translateValues(values: string[]): string[] {
    const valuesTranslated: string[] = [];
    values.forEach((el) => {
      valuesTranslated.push(this.translateKey(el));
    });
    return valuesTranslated;
  }

  public set language(value: string) {
    const lang = this.data[value];
    if (lang) {
      this.localeId = value;
      this.notify(lang.rtl);
    }
  }

  public get language(): string {
    return this.localeId;
  }

  private get messages(): string | void {
    const lang = this.data[this.localeId];

    if (lang) {
      return lang.messages;
    }
  }

  public get(key: string): string {
    return this.messages ? this.messages[key] : undefined;
  }
}
