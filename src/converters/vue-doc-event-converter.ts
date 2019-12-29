
import { Context, Converter } from 'typedoc/dist/lib/converter';
import { ConverterComponent } from 'typedoc/dist/lib/converter/components';
import { Comment, DeclarationReflection, ParameterReflection, ReferenceType, Reflection, ReflectionFlag, ReflectionKind, SignatureReflection } from 'typedoc/dist/lib/models';
import { ReflectionGroup } from 'typedoc/dist/lib/models/ReflectionGroup';
import { Component } from 'typedoc/dist/lib/utils';

import { makeAutoGenRegistry, PLUGIN_NAME, removeTag } from '../utils';
import { filterTags } from './filters';
import { parseVirtFn } from './utils';

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
		const eventInfos = parseVirtFn( targetReflection, 'vue-event', kind );

		// If no events, exit now.
		if ( eventInfos.length === 0 ) {
			return;
		}

		// Create or get the vue category & the model group
		const host = targetReflection.kind === ReflectionKind.CallSignature ? targetReflection.parent!.parent! : targetReflection;
		const modelGroup = VueDocEventConverter._groupFor( host, true );

		context.withScope( host, () => {
			eventInfos.forEach( eventInfo => {
				const eventReflection = new DeclarationReflection( eventInfo.name, ReflectionKind.Event );
				eventReflection.setFlag( ReflectionFlag.Exported, true );
				eventReflection.setFlag( ReflectionFlag.Public, true );

				const eventSignatureReflection = new SignatureReflection( eventInfo.name, ReflectionKind.CallSignature );
				eventSignatureReflection.comment = new Comment( eventInfo.description );
				eventSignatureReflection.parameters = eventInfo.params.map( p => {
					const paramReflection = new ParameterReflection( p.name, ReflectionKind.Parameter );
					paramReflection.comment = new Comment( p.description );
					paramReflection.type = new ReferenceType( p.type || 'unknown', ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME );
					return paramReflection;
				} );
				eventReflection.signatures = [eventSignatureReflection];

				modelGroup.children.push( eventReflection );
				eventReflection.parent = host;
				context.registerReflection( eventReflection );

				// Clear the doc tags
				removeTag( targetReflection, eventInfo.tag );
				eventInfo.params.forEach( eventParam => removeTag( targetReflection, eventParam.tag ) );
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
