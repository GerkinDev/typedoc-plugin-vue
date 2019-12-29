"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var VueDocPropConverter_1;
Object.defineProperty(exports, "__esModule", { value: true });
const converter_1 = require("typedoc/dist/lib/converter");
const components_1 = require("typedoc/dist/lib/converter/components");
const models_1 = require("typedoc/dist/lib/models");
const ReflectionGroup_1 = require("typedoc/dist/lib/models/ReflectionGroup");
const utils_1 = require("typedoc/dist/lib/utils");
const utils_2 = require("../utils");
const filters_1 = require("./filters");
let VueDocPropConverter = VueDocPropConverter_1 = class VueDocPropConverter extends components_1.ConverterComponent {
    static groupFor(reflection) {
        return this._groupFor(reflection, false);
    }
    initialize() {
        // After CategoryPlugin
        this.listenTo(this.owner, converter_1.Converter.EVENT_RESOLVE, this.onResolveReflection, -200);
    }
    onResolveReflection(context, reflection) {
        const tags = filters_1.filterTags(reflection, 'vue-prop', models_1.ReflectionKind.Property, true);
        if (!tags || tags.length === 0) {
            return;
        }
        // Mark it as public
        if (!(reflection.flags.hasFlag(models_1.ReflectionFlag.Public))) {
            context.getLogger().warn(`Property ${reflection.parent.name}.${reflection.name} is a vue-prop, and should be public.`);
        }
        reflection.setFlag(models_1.ReflectionFlag.Public, true);
        // Mark it as readonly
        if (!(reflection.flags.hasFlag(models_1.ReflectionFlag.Const))) {
            context.getLogger().warn(`Property ${reflection.parent.name}.${reflection.name} is a vue-prop, and should be readonly.`);
        }
        reflection.setFlag(models_1.ReflectionFlag.Const, true);
        // Create or get the vue category & the prop group
        const propGroup = VueDocPropConverter_1._groupFor(reflection.parent, true);
        propGroup.children.push(reflection);
        // Clear the doc tag
        utils_2.removeTag(reflection, tags[0]);
    }
};
VueDocPropConverter._groupFor = utils_2.makeAutoGenRegistry(() => new ReflectionGroup_1.ReflectionGroup('Vue Props', models_1.ReflectionKind.SetSignature));
VueDocPropConverter = VueDocPropConverter_1 = __decorate([
    utils_1.Component({ name: `${utils_2.PLUGIN_NAME}-prop-converter` })
], VueDocPropConverter);
exports.VueDocPropConverter = VueDocPropConverter;
//# sourceMappingURL=vue-doc-prop-converter.js.map