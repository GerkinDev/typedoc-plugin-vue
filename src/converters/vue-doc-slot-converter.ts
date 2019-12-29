
import { Context, Converter } from 'typedoc/dist/lib/converter';
import { ConverterComponent } from 'typedoc/dist/lib/converter/components';
import { Comment, DeclarationReflection, ParameterReflection, ReferenceType, Reflection, ReflectionFlag, ReflectionKind, SignatureReflection } from 'typedoc/dist/lib/models';
import { ReflectionGroup } from 'typedoc/dist/lib/models/ReflectionGroup';
import { Component } from 'typedoc/dist/lib/utils';

import { makeAutoGenRegistry, PLUGIN_NAME, removeTag } from '../utils';
import { filterTags } from './filters';
import { IVirtFnDeclaration, parseVirtFn } from './utils';

@Component( { name: `${PLUGIN_NAME}-slot-converter` } )
export class VueDocSlotConverter extends ConverterComponent {
	private static readonly _groupFor = makeAutoGenRegistry<Reflection, ReflectionGroup>( () => new ReflectionGroup( 'Vue Slots', ReflectionKind.Method ) );
	public static groupFor( reflection: Reflection ) {
		return this._groupFor( reflection, false );
	}

	protected initialize() {
		// Before CategoryPlugin
		this.listenTo( this.owner, Converter.EVENT_RESOLVE, this.onResolveReflection, -300 );
	}

// 	private static slotReflectionFromPseudoCode( context: Context, parentReflection: Reflection, slotDeclaration: IVirtFnDeclaration ) {
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

	private static slotReflectionFromData( context: Context, parentReflection: Reflection, slotDeclaration: IVirtFnDeclaration ) {
		const slotReflection = new DeclarationReflection( slotDeclaration.name, ReflectionKind.Method );
		slotReflection.setFlag( ReflectionFlag.Exported, true );
		slotReflection.setFlag( ReflectionFlag.Public, true );

		const slotSignatureReflection = new SignatureReflection( slotDeclaration.name, ReflectionKind.CallSignature );
		slotSignatureReflection.comment = new Comment( slotDeclaration.description );
		slotSignatureReflection.parameters = slotDeclaration.params.map( p => {
			const paramReflection = new ParameterReflection( p.name, ReflectionKind.Parameter );
			paramReflection.comment = new Comment( p.description );
			paramReflection.type = new ReferenceType( p.type || 'unknown', ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME );
			return paramReflection;
		} );

		slotReflection.signatures = [slotSignatureReflection];
		slotReflection.parent = parentReflection;
		context.registerReflection( slotReflection );
		return slotReflection;
	}

	public onResolveReflection( context: Context, reflection: Reflection ) {
		// Can be used only on declaration reflections
		if ( !( reflection instanceof DeclarationReflection ) ) {
			return;
		}

		const slotInfos = parseVirtFn( reflection, 'vue-slot', ReflectionKind.Class );

		// If no slots, exit now.
		if ( slotInfos.length === 0 ) {
			return;
		}

		// Create or get the vue category & the slots group
		const slotGroup = VueDocSlotConverter._groupFor( reflection, true );

		// Create declarations for each slot
		slotInfos.forEach( slotInfo => {
			context.withScope( reflection, () => {
				// const slotReflection = VueDocCommentSlotConverterComponent.slotReflectionFromPseudoCode( context, reflection, slotDeclaration );
				const slotReflection = VueDocSlotConverter.slotReflectionFromData( context, reflection, slotInfo );

				slotGroup.children.push( slotReflection );
				reflection.children!.push( slotReflection );

				// Clear the doc tags
				removeTag( reflection, slotInfo.tag );
				slotInfo.params.forEach( slotParam => removeTag( reflection, slotParam.tag ) );
			} );
		} );
	}
}
