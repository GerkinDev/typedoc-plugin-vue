
import { Context, Converter } from 'typedoc/dist/lib/converter';
import { ConverterComponent } from 'typedoc/dist/lib/converter/components';
import { Comment, DeclarationReflection, ParameterReflection, ReferenceType, Reflection, ReflectionFlag, ReflectionKind, SignatureReflection } from 'typedoc/dist/lib/models';
import { ReflectionGroup } from 'typedoc/dist/lib/models/ReflectionGroup';
import { Component } from 'typedoc/dist/lib/utils';

import { makeAutoGenRegistry, PLUGIN_NAME, removeTag } from '../utils';
import { filterTags } from './filters';

interface ISlotDeclaration {
	name: string;
	description: string;
	params: Array<{
		name: string;
		description: string;
		type: string;
	}>;
}

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

	private static slotReflectionFromData( context: Context, parentReflection: DeclarationReflection, slotDeclaration: ISlotDeclaration ) {
		const slotReflection = new DeclarationReflection( slotDeclaration.name, ReflectionKind.Method );
		slotReflection.setFlag( ReflectionFlag.Exported, true );
		slotReflection.setFlag( ReflectionFlag.Public, true );

		const slotSignatureReflection = new SignatureReflection( slotDeclaration.name, ReflectionKind.CallSignature );
		slotSignatureReflection.comment = new Comment( slotDeclaration.description );
		slotSignatureReflection.parameters = slotDeclaration.params.map( p => {
			const paramReflection = new ParameterReflection( p.name, ReflectionKind.Parameter );
			paramReflection.comment = new Comment( p.description );
			paramReflection.type = new ReferenceType( p.type, ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME );
			return paramReflection;
		} );

		slotReflection.signatures = [slotSignatureReflection];
		slotReflection.parent = parentReflection;
		context.registerReflection( slotReflection );
		return slotReflection;
	}

	public onResolveReflection( context: Context, reflection: Reflection ) {
		if ( !( reflection instanceof DeclarationReflection ) ) {
			return;
		}

		const slotTags = filterTags( reflection, 'vue-slot', ReflectionKind.Class, false );
		if ( !slotTags || slotTags.length === 0 ) {
			return;
		}

		// Create or get the vue category & the slots group
		const slotGroup = VueDocSlotConverter._groupFor( reflection, true );

		const slotParamTags = filterTags( reflection, 'vue-slot-param', ReflectionKind.Class, false ) || [];
		// Extract slot parameter infos
		const slotParamInfos = slotParamTags
			.map( tag => {
				const tagTextParts = tag.text.split( /\s/ );
				return {
					paramName: tagTextParts[1].trim(),
					slotName: tagTextParts[0].trim(),
					tag,
					text: tagTextParts.slice( 3 ).join( ' ' ).trim(),
					type: tagTextParts[2].trim(),
				};
			} );
		// Aggregate parameters & slots declarations
		const slotInfos = slotTags
			.map( tag => {
				const tagTextParts = tag.text.split( /\s/ );
				return {
					slotName: tagTextParts[0].trim(),
					tag,
					text: tagTextParts.slice( 1 ).join( ' ' ).trim(),
				};
			} )
			.map( slotInfo => ( {
				params: slotParamInfos.filter( slotParam => slotParam.slotName === slotInfo.slotName ),
				slot: slotInfo,
			} ) );

		// Create declarations for each slot
		slotInfos.forEach( slotInfo => {
			const slotDeclaration = {
				description: slotInfo.slot.text,
				name: slotInfo.slot.slotName,
				params: slotInfo.params.map( param => ( {
					description: param.text,
					name: param.paramName,
					type: param.type,
				} ) ),
			};
			context.withScope( reflection, () => {
				// const slotReflection = VueDocCommentSlotConverterComponent.slotReflectionFromPseudoCode( context, reflection, slotDeclaration );
				const slotReflection = VueDocSlotConverter.slotReflectionFromData( context, reflection, slotDeclaration );

				slotGroup.children.push( slotReflection );
				reflection.children!.push( slotReflection );

				// Clear the doc tags
				removeTag( reflection, slotInfo.slot.tag );
				slotInfo.params.forEach( slotParam => removeTag( reflection, slotParam.tag ) );
			} );
		} );
	}
}
