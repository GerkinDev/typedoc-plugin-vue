"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var VueDocEventConverter_1;
Object.defineProperty(exports, "__esModule", { value: true });
const converter_1 = require("typedoc/dist/lib/converter");
const components_1 = require("typedoc/dist/lib/converter/components");
const models_1 = require("typedoc/dist/lib/models");
const ReflectionGroup_1 = require("typedoc/dist/lib/models/ReflectionGroup");
const utils_1 = require("typedoc/dist/lib/utils");
const utils_2 = require("../utils");
const filters_1 = require("./filters");
let VueDocEventConverter = VueDocEventConverter_1 = class VueDocEventConverter extends components_1.ConverterComponent {
    static groupFor(reflection) {
        return this._groupFor(reflection, false);
    }
    initialize() {
        // After CategoryPlugin
        this.listenTo(this.owner, converter_1.Converter.EVENT_RESOLVE, this.onResolveReflection, -200);
    }
    declareReflectionEvent(context, targetReflection, kind) {
        const eventTags = filters_1.filterTags(targetReflection, 'vue-event', kind, false);
        if (!eventTags || eventTags.length === 0) {
            return;
        }
        // Create or get the vue category & the model group
        const host = targetReflection.kind === models_1.ReflectionKind.CallSignature ? targetReflection.parent.parent : targetReflection;
        const modelGroup = VueDocEventConverter_1._groupFor(host, true);
        const eventParamsTags = filters_1.filterTags(targetReflection, 'vue-event-param', kind, false);
        // Extract slot parameter infos
        const eventParamInfos = eventParamsTags
            .map(tag => {
            const tagTextParts = tag.text.split(/\s/);
            return {
                eventName: tagTextParts[0].trim(),
                paramName: tagTextParts[1].trim(),
                tag,
                text: tagTextParts.slice(3).join(' ').trim(),
                type: tagTextParts[2].trim(),
            };
        });
        // Aggregate parameters & slots declarations
        const eventInfos = eventTags
            .map(tag => {
            const tagTextParts = tag.text.split(/\s/);
            return {
                eventName: tagTextParts[0].trim(),
                tag,
                text: tagTextParts.slice(1).join(' ').trim(),
            };
        })
            .map(slotInfo => ({
            event: slotInfo,
            params: eventParamInfos.filter(slotParam => slotParam.eventName === slotInfo.eventName),
        }));
        context.withScope(host, () => {
            eventInfos.forEach(tag => {
                const eventReflection = new models_1.DeclarationReflection(tag.event.eventName, models_1.ReflectionKind.Event);
                eventReflection.setFlag(models_1.ReflectionFlag.Exported, true);
                eventReflection.setFlag(models_1.ReflectionFlag.Public, true);
                const eventSignatureReflection = new models_1.SignatureReflection(tag.event.eventName, models_1.ReflectionKind.CallSignature);
                eventSignatureReflection.comment = new models_1.Comment(tag.event.text);
                eventSignatureReflection.parameters = tag.params.map(p => {
                    const paramReflection = new models_1.ParameterReflection(p.paramName, models_1.ReflectionKind.Parameter);
                    paramReflection.comment = new models_1.Comment(p.text);
                    paramReflection.type = new models_1.ReferenceType(p.type, models_1.ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME);
                    return paramReflection;
                });
                eventReflection.signatures = [eventSignatureReflection];
                modelGroup.children.push(eventReflection);
                eventReflection.parent = host;
                context.registerReflection(eventReflection);
                // Clear the doc tags
                utils_2.removeTag(targetReflection, tag.event.tag);
                tag.params.forEach(eventParam => utils_2.removeTag(targetReflection, eventParam.tag));
            });
        });
    }
    onResolveReflection(context, reflection) {
        var _a;
        if (!(reflection instanceof models_1.DeclarationReflection)) {
            return;
        }
        switch (reflection.kind) {
            case models_1.ReflectionKind.Method:
                (_a = reflection.signatures) === null || _a === void 0 ? void 0 : _a.forEach(signature => this.declareReflectionEvent(context, signature, models_1.ReflectionKind.CallSignature));
                break;
            case models_1.ReflectionKind.Class:
                this.declareReflectionEvent(context, reflection, models_1.ReflectionKind.Class);
                break;
        }
    }
};
VueDocEventConverter._groupFor = utils_2.makeAutoGenRegistry(() => new ReflectionGroup_1.ReflectionGroup('Vue Events', models_1.ReflectionKind.Event));
VueDocEventConverter = VueDocEventConverter_1 = __decorate([
    utils_1.Component({ name: `${utils_2.PLUGIN_NAME}-event-converter` })
], VueDocEventConverter);
exports.VueDocEventConverter = VueDocEventConverter;
//# sourceMappingURL=vue-doc-event-converter.js.map