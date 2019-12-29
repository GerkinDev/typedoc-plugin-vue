import { VueDocEventConverter } from './vue-doc-event-converter';
import { VueDocModelConverter } from './vue-doc-model-converter';
import { VueDocPropConverter } from './vue-doc-prop-converter';
import { VueDocSlotConverter } from './vue-doc-slot-converter';

export const converters = [VueDocModelConverter, VueDocPropConverter, VueDocSlotConverter, VueDocEventConverter];
