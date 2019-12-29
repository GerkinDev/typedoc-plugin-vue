
import { Context, Converter } from 'typedoc/dist/lib/converter';
import { ConverterComponent } from 'typedoc/dist/lib/converter/components';
import { Comment, DeclarationReflection, ParameterReflection, ReferenceType, Reflection, ReflectionFlag, ReflectionKind, SignatureReflection } from 'typedoc/dist/lib/models';
import { ReflectionGroup } from 'typedoc/dist/lib/models/ReflectionGroup';
import { Component } from 'typedoc/dist/lib/utils';

import { makeAutoGenRegistry, PLUGIN_NAME, removeTag } from '../utils';
import { filterTags } from './filters';

@Component( { name: `${PLUGIN_NAME}-event-converter` } )
export class VueDocEventConverter extends ConverterComponent {
	private static readonly _groupFor = makeAutoGenRegistry<Reflection, ReflectionGroup>( () => new ReflectionGroup( 'Vue Events', ReflectionKind.Event ) );
	public static groupFor( reflection: DeclarationReflection ) {
		return this._groupFor( reflection, false );
	}

	protected initialize() {
		// After CategoryPlugin
		this.listenTo( this.owner, Converter.EVENT_RESOLVE, this.onResolveReflection, -200 );
	}

	private declareReflectionEvent( context: Context, targetReflection: DeclarationReflection | SignatureReflection, kind: ReflectionKind ) {
		const eventTags = filterTags( targetReflection, 'vue-event', kind, false );
		if ( !eventTags || eventTags.length === 0 ) {
			return;
		}

		// Create or get the vue category & the model group
		const host = targetReflection.kind === ReflectionKind.CallSignature ? targetReflection.parent!.parent! : targetReflection;
		const modelGroup = VueDocEventConverter._groupFor( host, true );

		const eventParamsTags = filterTags( targetReflection, 'vue-event-param', kind, false );
		// Extract slot parameter infos
		const eventParamInfos = eventParamsTags
			.map( tag => {
				const tagTextParts = tag.text.split( /\s/ );
				return {
					eventName: tagTextParts[0].trim(),
					paramName: tagTextParts[1].trim(),
					tag,
					text: tagTextParts.slice( 3 ).join( ' ' ).trim(),
					type: tagTextParts[2].trim(),
				};
			} );
		// Aggregate parameters & slots declarations
		const eventInfos = eventTags
			.map( tag => {
				const tagTextParts = tag.text.split( /\s/ );
				return {
					eventName: tagTextParts[0].trim(),
					tag,
					text: tagTextParts.slice( 1 ).join( ' ' ).trim(),
				};
			} )
			.map( slotInfo => ( {
				event: slotInfo,
				params: eventParamInfos.filter( slotParam => slotParam.eventName === slotInfo.eventName ),
			} ) );

		context.withScope( host, () => {
			eventInfos.forEach( tag => {
				const eventReflection = new DeclarationReflection( tag.event.eventName, ReflectionKind.Event );
				eventReflection.setFlag( ReflectionFlag.Exported, true );
				eventReflection.setFlag( ReflectionFlag.Public, true );

				const eventSignatureReflection = new SignatureReflection( tag.event.eventName, ReflectionKind.CallSignature );
				eventSignatureReflection.comment = new Comment( tag.event.text );
				eventSignatureReflection.parameters = tag.params.map( p => {
					const paramReflection = new ParameterReflection( p.paramName, ReflectionKind.Parameter );
					paramReflection.comment = new Comment( p.text );
					paramReflection.type = new ReferenceType( p.type, ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME );
					return paramReflection;
				} );
				eventReflection.signatures = [eventSignatureReflection];

				modelGroup.children.push( eventReflection );
				eventReflection.parent = host;
				context.registerReflection( eventReflection );

				// Clear the doc tags
				removeTag( targetReflection, tag.event.tag );
				tag.params.forEach( eventParam => removeTag( targetReflection, eventParam.tag ) );
			} );
		} );
	}

	public onResolveReflection( context: Context, reflection: Reflection ) {
		if ( !( reflection instanceof DeclarationReflection ) ) {
			return;
		}
		switch ( reflection.kind ) {
			case ReflectionKind.Method:
				reflection.signatures?.forEach( signature => this.declareReflectionEvent( context, signature, ReflectionKind.CallSignature ) );
				break;
			case ReflectionKind.Class:
				this.declareReflectionEvent( context, reflection, ReflectionKind.Class );
				break;
		}
	}
}
