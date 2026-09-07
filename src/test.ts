import 'zone.js';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import '@angular/localize/init';
import '@testing-library/jest-dom/extend-expect';
import 'jest-extended';
import { TextEncoder, TextDecoder } from 'util';

setupZoneTestEnv();

Object.assign(global, { TextDecoder, TextEncoder });

Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => {
      return '';
    },
  }),
});

Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>',
});
Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    };
  },
});

Object.defineProperty(global.self, 'crypto', {
  value: {
    getRandomValues: (arr) => arr,
  },
});
