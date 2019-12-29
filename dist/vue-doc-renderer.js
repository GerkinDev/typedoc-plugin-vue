"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("typedoc/dist/lib/models");
const components_1 = require("typedoc/dist/lib/output/components");
const events_1 = require("typedoc/dist/lib/output/events");
const utils_1 = require("typedoc/dist/lib/utils");
const converters_1 = require("./converters");
const utils_2 = require("./utils");
let VueDocRenderer = class VueDocRenderer extends components_1.ContextAwareRendererComponent {
    initialize() {
        this.listenTo(this.owner, events_1.PageEvent.BEGIN, this.onBeginPage);
    }
    onBeginPage(page) {
        var _a;
        if (page.model instanceof models_1.DeclarationReflection) {
            // const vueCategory = getReflectionVueCategory( page.model, true );
            const generatedVueGroups = converters_1.converters
                .map(converter => converter.groupFor(page.model))
                .filter(((v) => !!v));
            if (generatedVueGroups.length > 0) {
                // Filter out vue defs from standard defs
                const allVueChildren = Array.from(new Set(generatedVueGroups.map(val => val.children).flat(1)));
                (_a = page.model.groups) === null || _a === void 0 ? void 0 : _a.forEach(group => {
                    group.children = group.children.filter(child => !allVueChildren.includes(child));
                });
                page.model.groups = generatedVueGroups.concat(page.model.groups || []);
                console.log(page.model.name, page.model.groups.map(g => g.title));
            }
            // addOrInitArray( page.model, 'categories', vueCategory );
            // addOrInitArray( page.model, 'groups', slotGroup );
        }
    }
};
VueDocRenderer = __decorate([
    utils_1.Component({ name: `${utils_2.PLUGIN_NAME}-renderer` })
], VueDocRenderer);
exports.VueDocRenderer = VueDocRenderer;
//# sourceMappingURL=vue-doc-renderer.js.map