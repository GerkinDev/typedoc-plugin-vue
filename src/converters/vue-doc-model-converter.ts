
import { Context, Converter } from 'typedoc/dist/lib/converter';
import { ConverterComponent } from 'typedoc/dist/lib/converter/components';
import { DeclarationReflection, Reflection, ReflectionFlag, ReflectionKind } from 'typedoc/dist/lib/models';
import { ReflectionGroup } from 'typedoc/dist/lib/models/ReflectionGroup';
import { Component } from 'typedoc/dist/lib/utils';

import { makeAutoGenRegistry, PLUGIN_NAME, removeTag } from '../utils';
import { filterTags } from './filters';

@Component( { name: `${PLUGIN_NAME}-model-converter` } )
export class VueDocModelConverter extends ConverterComponent {
	private static readonly _groupFor = makeAutoGenRegistry<Reflection, ReflectionGroup>( () => new ReflectionGroup( 'Vue Model', ReflectionKind.Accessor ) );
	public static groupFor( reflection: DeclarationReflection ) {
		return this._groupFor( reflection, false );
	}

	protected initialize() {
		// After CategoryPlugin
		this.listenTo( this.owner, Converter.EVENT_RESOLVE, this.onResolveReflection, -200 );
	}

	public onResolveReflection( context: Context, reflection: Reflection ) {
		const tags = filterTags( reflection, 'vue-model', ReflectionKind.Property, true );
		if ( !tags || tags.length === 0 ) {
			return;
		}

		// Mark it as public
		if ( !( reflection.flags.hasFlag( ReflectionFlag.Public ) ) ) {
			context.getLogger().warn( `Property ${reflection.parent!.name}.${reflection.name} is a vue-model, and should be public.` );
		}
		reflection.setFlag( ReflectionFlag.Public, true );

		// Create or get the vue category & the model group
		const modelGroup = VueDocModelConverter._groupFor( reflection.parent!, true );
		modelGroup.children.push( reflection );

		// Clear the doc tag
		removeTag( reflection, tags[0] );
	}
}
