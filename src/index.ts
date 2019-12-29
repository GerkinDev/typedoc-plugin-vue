import { PluginHost } from 'typedoc/dist/lib/utils';

import { converters } from './converters';
import { VueDocRenderer } from './vue-doc-renderer';

export = ( pluginHost: PluginHost ) => {
	const app = pluginHost.owner;

	app.renderer.addComponent( VueDocRenderer.name, new VueDocRenderer( app.renderer ) );
	converters.forEach( c => {
        console.log('Registering ', c.name)
		app.converter.addComponent( c.name, new c( app.converter ) );
	} );
};
