import { Reflection, ReflectionKind } from 'typedoc/dist/lib/models';

import { getKindStr } from './utils';

export const filterTags = ( reflection: Reflection, tagName: string, constraintHost: ReflectionKind | readonly ReflectionKind[], single: boolean ) => {
	const matchedTags = reflection.comment?.tags?.filter( t => t.tagName === tagName ) ?? [];
	// If no tags, exit now
	if ( matchedTags.length === 0 ) {
		return [];
	}

	// Ensure it is used correctly
	// On host
	const constraintHosts = Array.isArray( constraintHost ) ? constraintHost : [constraintHost];
	if ( !constraintHosts.includes( reflection.kind ) ) {
		const constraintHostsStrs = constraintHosts.map( getKindStr );
		const constraintStr = constraintHostsStrs.length === 1 ? constraintHostsStrs : `one of [${constraintHostsStrs.join( ', ' )}]`;
		const kindStr = getKindStr( reflection.kind );
		throw new SyntaxError( `@${tagName} tag can only be used on ${constraintStr}, but it is used on ${kindStr} (${reflection.kind})` );
	}
	// Ensure there is a single tag if the option is set.
	if ( single && matchedTags.length > 1 ) {
		throw new SyntaxError( `Expected a single @${tagName} tag.` );
	}
	return matchedTags;
};
