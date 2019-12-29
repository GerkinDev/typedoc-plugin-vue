"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vue_doc_event_converter_1 = require("./vue-doc-event-converter");
const vue_doc_model_converter_1 = require("./vue-doc-model-converter");
const vue_doc_prop_converter_1 = require("./vue-doc-prop-converter");
const vue_doc_slot_converter_1 = require("./vue-doc-slot-converter");
exports.converters = [vue_doc_model_converter_1.VueDocModelConverter, vue_doc_prop_converter_1.VueDocPropConverter, vue_doc_slot_converter_1.VueDocSlotConverter, vue_doc_event_converter_1.VueDocEventConverter];
//# sourceMappingURL=index.js.map