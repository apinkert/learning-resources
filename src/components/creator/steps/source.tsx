import { STEP_KIND } from './kind';
import { REQUIRED } from './common';

export const STEP_SOURCE = 'step-source';
export const NAME_SOURCE = 'source';

export function isSourceStep(name: string): boolean {
  return name === STEP_SOURCE;
}

export function makeSourceStep() {
  return {
    name: STEP_SOURCE,
    title: 'Select source',
    fields: [
      {
        component: 'lr-source-selector',
        name: NAME_SOURCE,
        isRequired: true,
        validate: [REQUIRED],
      },
    ],
    nextStep: STEP_KIND,
  };
}
