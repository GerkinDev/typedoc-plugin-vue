import { DeclarationReflection, Reflection } from 'typedoc/dist/lib/models';
import { ReflectionGroup } from 'typedoc/dist/lib/models/ReflectionGroup';
import { ContextAwareRendererComponent } from 'typedoc/dist/lib/output/components';
import { PageEvent } from 'typedoc/dist/lib/output/events';
import { Component } from 'typedoc/dist/lib/utils';

import { converters } from './converters';
import { PLUGIN_NAME } from './utils';

@Component( { name: `${PLUGIN_NAME}-renderer` } )
export class VueDocRenderer extends ContextAwareRendererComponent {
	public initialize() {
		this.listenTo( this.owner, PageEvent.BEGIN, this.onBeginPage );
	}

	public onBeginPage( page: PageEvent ) {
		if ( page.model instanceof DeclarationReflection ) {
			// const vueCategory = getReflectionVueCategory( page.model, true );

			const generatedVueGroups = converters
				.map( converter => converter.groupFor( page.model ) )
				.filter<ReflectionGroup>( ( ( v: any ) => !!v ) as any );
			if ( generatedVueGroups.length > 0 ) {
				// Filter out vue defs from standard defs
				const allVueChildren = Array.from( new Set( generatedVueGroups.map( val => val.children ).flat( 1 ) ) );
				page.model.groups?.forEach( group => {
					group.children = group.children.filter( child => !allVueChildren.includes( child ) );
				} );

				page.model.groups = generatedVueGroups.concat( page.model.groups || [] );
				console.log( page.model.name, page.model.groups.map( g => g.title ) );
			}
			// addOrInitArray( page.model, 'categories', vueCategory );
			// addOrInitArray( page.model, 'groups', slotGroup );
		}
	}
}
