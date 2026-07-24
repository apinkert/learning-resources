import { componentTypes } from '@data-driven-forms/react-form-renderer';
import { ALL_ITEM_KINDS, ALL_KIND_ENTRIES } from '../meta';
import { NAME_KIND, REQUIRED } from './common';
import { detailsStepName } from './details';

export const STEP_KIND = 'step-kind';

export function isKindStep(name: string): boolean {
  return name === STEP_KIND;
}

export function makeKindStep() {
  return {
    name: STEP_KIND,
    title: 'Select content type',
    fields: [
      {
        component: componentTypes.PLAIN_TEXT,
        name: 'internal-text-kind-description',
        label: "Learning resources are grouped by their 'content type'.",
      },
      {
        component: componentTypes.RADIO,
        name: NAME_KIND,
        label: 'Select content type',
        simpleValue: true,
        options: ALL_KIND_ENTRIES.map(([name, value]) => ({
          value: name,
          label: value.displayName,
        })),
        isRequired: true,
        validate: [REQUIRED],
      },
    ],
    nextStep: {
      when: NAME_KIND,
      stepMapper: Object.fromEntries(
        ALL_ITEM_KINDS.map((kind) => [kind, detailsStepName(kind)])
      ),
    },
  };
}
