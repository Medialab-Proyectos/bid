import { OptionsMenuComponent } from './options-menu.component';
import { PopupModule } from '@progress/kendo-angular-popup';
import { render, screen } from '@testing-library/angular';

import { CommonModule } from '@angular/common';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('OptionsMenuComponent', () => {
  async function setup() {
    const { fixture } = await render(OptionsMenuComponent, {
      componentProperties: {
        options: ['Edit', 'Show more'],
      },
      //declarations: [ OptionsMenuComponent ],
      imports: [
        CommonModule,
        PopupModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
    });

    const component = fixture.debugElement.componentInstance;
    component.anchor = document.createElement('button');

    return {
      component,
      fixture,
    };
  }

  it('should open list', async () => {
    const { component } = await setup();

    component.toggle(true);

    const listOption = await screen.findByText(/show more/i);

    expect(listOption).toBeTruthy();
  });

  it('should close list', async () => {
    const { component } = await setup();
    component.expandedOptions = true;
    component.toggle(false);

    const listOption = screen.queryByText(/show more/i);

    expect(listOption).not.toBeTruthy();
  });

  it('should list have 2 elements', async () => {
    const { component } = await setup();

    component.toggle(true);

    const items = await screen.findAllByTestId('listitem');

    expect(items.length).toBe(2);
  });

  it('should set the expandedOptions property to false', async () => {
    const { component, fixture } = await setup();
    component.expandedOptions = true;
    fixture.detectChanges();
    component.close();

    expect(component.expandedOptions).toBe(false);
  });

  it('should close the options if closeOnClick is true', async () => {
    const { component, fixture } = await setup();
    const option = '1';
    component.closeOnClick = true;
    fixture.detectChanges();

    const spyEmitter = jest.spyOn(component['optionClick'], 'emit');
    const spyClose = jest.spyOn(component, 'close');
    component.onOptionClick(option);

    expect(spyEmitter).toHaveBeenCalledWith(option);
    expect(spyClose).toHaveBeenCalled();
  });
});
