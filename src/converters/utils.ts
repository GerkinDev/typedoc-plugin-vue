import { Many } from 'lodash';
import { CommentTag, Reflection, ReflectionKind } from 'typedoc/dist/lib/models';
import { filterTags } from './filters';

export const getKindStr = ( kind: ReflectionKind ) => Object.entries( ReflectionKind ).find( ( [, v] ) => v === kind )?.[0];

const tagRegex = /^(\S+)\s+(\S+)\s+(?:<(.+?)>\s+)?-\s+(.*$)/;
export const parseVirtFnParamTag = ( tag: CommentTag ) => {
	const text = tag.text.trim();
	const matches = text.match( tagRegex );
	if ( !matches ) {
		throw new SyntaxError( `Tag of type ${tag.tagName} has incorrect text "${text}"` );
	}
	return {
		paramDesc: matches[4],
		paramName: matches[2],
		paramType: matches[3] as string | undefined,
		virtFnName: matches[1],
	};
};

export interface IVirtFnDeclaration {
	name: string;
	description: string;
	tag: CommentTag;
	params: Array<{
		name: string;
		description: string;
		type?: string;
		tag: CommentTag;
	}>;
}
export const parseVirtFn = ( reflection: Reflection, virtFnId: string, kind: Many<ReflectionKind> ): IVirtFnDeclaration[] => {
	const virtFnTags = filterTags( reflection, virtFnId, kind, false );
	if ( virtFnTags.length === 0 ) {
		return [];
	}

	const virtFnParamsTags = filterTags( reflection, virtFnId + '-param', kind, false );
	// Extract virtual functions parameter infos
	const virtFnParamInfos = virtFnParamsTags
		.map( tag => ( {
			...parseVirtFnParamTag( tag ),
			tag,
		} ) );
	// Aggregate parameters & virtual functions declarations
	const virtFnInfos = virtFnTags
		.map( tag => {
			const tagTextParts = tag.text.split( /\s/ );
			return {
				description: tagTextParts.slice( 1 ).join( ' ' ).trim(),
				name: tagTextParts[0].trim(),
				tag,
			};
		} )
		.map( virtFnInfo => ( {
			...virtFnInfo,
			params: virtFnParamInfos
				// Only params of this virtual function
				.filter( virtFnParam => virtFnParam.virtFnName === virtFnInfo.name )
				.map( virtFnParam => ( {
					description: virtFnParam.paramDesc,
					name: virtFnParam.paramName,
					tag: virtFnParam.tag,
					type: virtFnParam.paramType,
				} ) ),
		} ) );
	return virtFnInfos;
};
