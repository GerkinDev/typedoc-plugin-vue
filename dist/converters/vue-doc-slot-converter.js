"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var VueDocSlotConverter_1;
Object.defineProperty(exports, "__esModule", { value: true });
const converter_1 = require("typedoc/dist/lib/converter");
const components_1 = require("typedoc/dist/lib/converter/components");
const models_1 = require("typedoc/dist/lib/models");
const ReflectionGroup_1 = require("typedoc/dist/lib/models/ReflectionGroup");
const utils_1 = require("typedoc/dist/lib/utils");
const utils_2 = require("../utils");
const filters_1 = require("./filters");
let VueDocSlotConverter = VueDocSlotConverter_1 = class VueDocSlotConverter extends components_1.ConverterComponent {
    static groupFor(reflection) {
        return this._groupFor(reflection, false);
    }
    initialize() {
        // Before CategoryPlugin
        this.listenTo(this.owner, converter_1.Converter.EVENT_RESOLVE, this.onResolveReflection, -300);
    }
    // 	private static slotReflectionFromPseudoCode( context: Context, parentReflection: DeclarationReflection, slotDeclaration: ISlotDeclaration ) {
    // 		const virtualFnCode = `export class ${parentReflection.name} {
    // 	/**
    // 	 * ${slotDeclaration.description}
    // 	 *
    // 	 * ${slotDeclaration.params.map( param => `@param ${param.name} - ${param.description}` ).join( '\n\t * ' )}
    // 	 */
    // 	public ${JSON.stringify( slotDeclaration.name )}(${slotDeclaration.params.map( param =>
    // 			`${param.name}: ${param.type}` ).join( ', ' )}): void {}
    // }`;
    // 		const virtualFnNode = createSourceFile( parentReflection.sources![0].fileName, virtualFnCode, ScriptTarget.ESNext, true, ScriptKind.External );
    // 		const docNode = virtualFnNode.getChildAt( 0 );
    // 		// docNode.kind === SyntaxKind.SyntaxList
    // 		const classNode = docNode.getChildAt( 0 );
    // 		// classNode.kind ===  SyntaxKind.ClassDeclaration
    // 		if ( isClassDeclaration( classNode ) ) {
    // 			if ( classNode.members.length !== 1 ) {
    // 				throw new SyntaxError();
    // 			}
    // 			const fnNode = classNode.members[0];
    // 			console.log( inspect( fnNode, { colors: true, depth: 6 } ) );
    // 			const newReflection = ( context.converter.convertNode as any )(
    // 				context,
    // 				Object.assign( fnNode, { symbol: ( fnNode as any ).symbol || { name: slotDeclaration.name } } ),
    // 				false,
    // 			);
    // 			// console.log( newReflection );
    // 			if ( !newReflection || !( newReflection instanceof DeclarationReflection ) ) {
    // 				throw new TypeError();
    // 			}
    // 			newReflection.sources = undefined;
    // 			newReflection.signatures?.forEach( s => s.sources = undefined );
    // 			context.registerReflection( newReflection, fnNode );
    // 			return newReflection;
    // 		} else {
    // 			throw new SyntaxError();
    // 		}
    // 	}
    static slotReflectionFromData(context, parentReflection, slotDeclaration) {
        const slotReflection = new models_1.DeclarationReflection(slotDeclaration.name, models_1.ReflectionKind.Method);
        slotReflection.setFlag(models_1.ReflectionFlag.Exported, true);
        slotReflection.setFlag(models_1.ReflectionFlag.Public, true);
        const slotSignatureReflection = new models_1.SignatureReflection(slotDeclaration.name, models_1.ReflectionKind.CallSignature);
        slotSignatureReflection.comment = new models_1.Comment(slotDeclaration.description);
        slotSignatureReflection.parameters = slotDeclaration.params.map(p => {
            const paramReflection = new models_1.ParameterReflection(p.name, models_1.ReflectionKind.Parameter);
            paramReflection.comment = new models_1.Comment(p.description);
            paramReflection.type = new models_1.ReferenceType(p.type, models_1.ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME);
            return paramReflection;
        });
        slotReflection.signatures = [slotSignatureReflection];
        slotReflection.parent = parentReflection;
        context.registerReflection(slotReflection);
        return slotReflection;
    }
    onResolveReflection(context, reflection) {
        if (!(reflection instanceof models_1.DeclarationReflection)) {
            return;
        }
        const slotTags = filters_1.filterTags(reflection, 'vue-slot', models_1.ReflectionKind.Class, false);
        if (!slotTags || slotTags.length === 0) {
            return;
        }
        // Create or get the vue category & the slots group
        const slotGroup = VueDocSlotConverter_1._groupFor(reflection, true);
        const slotParamTags = filters_1.filterTags(reflection, 'vue-slot-param', models_1.ReflectionKind.Class, false) || [];
        // Extract slot parameter infos
        const slotParamInfos = slotParamTags
            .map(tag => {
            const tagTextParts = tag.text.split(/\s/);
            return {
                paramName: tagTextParts[1].trim(),
                slotName: tagTextParts[0].trim(),
                tag,
                text: tagTextParts.slice(3).join(' ').trim(),
                type: tagTextParts[2].trim(),
            };
        });
        // Aggregate parameters & slots declarations
        const slotInfos = slotTags
            .map(tag => {
            const tagTextParts = tag.text.split(/\s/);
            return {
                slotName: tagTextParts[0].trim(),
                tag,
                text: tagTextParts.slice(1).join(' ').trim(),
            };
        })
            .map(slotInfo => ({
            params: slotParamInfos.filter(slotParam => slotParam.slotName === slotInfo.slotName),
            slot: slotInfo,
        }));
        // Create declarations for each slot
        slotInfos.forEach(slotInfo => {
            const slotDeclaration = {
                description: slotInfo.slot.text,
                name: slotInfo.slot.slotName,
                params: slotInfo.params.map(param => ({
                    description: param.text,
                    name: param.paramName,
                    type: param.type,
                })),
            };
            context.withScope(reflection, () => {
                // const slotReflection = VueDocCommentSlotConverterComponent.slotReflectionFromPseudoCode( context, reflection, slotDeclaration );
                const slotReflection = VueDocSlotConverter_1.slotReflectionFromData(context, reflection, slotDeclaration);
                slotGroup.children.push(slotReflection);
                reflection.children.push(slotReflection);
                // Clear the doc tags
                utils_2.removeTag(reflection, slotInfo.slot.tag);
                slotInfo.params.forEach(slotParam => utils_2.removeTag(reflection, slotParam.tag));
            });
        });
    }
};
VueDocSlotConverter._groupFor = utils_2.makeAutoGenRegistry(() => new ReflectionGroup_1.ReflectionGroup('Vue Slots', models_1.ReflectionKind.Method));
VueDocSlotConverter = VueDocSlotConverter_1 = __decorate([
    utils_1.Component({ name: `${utils_2.PLUGIN_NAME}-slot-converter` })
], VueDocSlotConverter);
exports.VueDocSlotConverter = VueDocSlotConverter;
//# sourceMappingURL=vue-doc-slot-converter.js.map