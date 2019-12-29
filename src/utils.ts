import { CommentTag, DeclarationReflection, Reflection } from 'typedoc/dist/lib/models';
import { ReflectionCategory } from 'typedoc/dist/lib/models/ReflectionCategory';

export const PLUGIN_NAME = 'typedoc-plugin-vue';

type ArrayKeys<T> = {[key in keyof T]: T[key] extends any[] ? T[key] : never};
type Unpacked<T> = T extends Array<infer U> ? U : never;
export const addOrInitArray = <T, P extends keyof ArrayKeys<T>>( obj: T, prop: P, val: Unpacked<T[P]> ) => {
	if ( typeof obj[prop] === 'undefined' || Array.isArray( obj[prop] ) ) {
		obj[prop] = [
			...( obj[prop] || [] ) as any,
			val,
		] as any;
	} else {
		throw new TypeError( `Invalid type for prop ${prop}` );
	}
};

export const removeTag = ( reflection: Reflection, tag: CommentTag ) => {
	const tags = reflection.comment!.tags!;
	tags.splice( tags.indexOf( tag ), 1 );
};

export const makeAutoGenRegistry = <TKey, TVal>( newItemFactory: ( key: TKey ) => TVal ):
	( ( reflection: TKey, createIfNotExists: true ) => TVal ) &
	( ( reflection: TKey, createIfNotExists: false ) => TVal | undefined ) => {
	const map = new Map<TKey, TVal>();
	return ( key: TKey, createIfNotExists: boolean ): any => {
		const existing = map.get( key );
		if ( !existing && !createIfNotExists ) {
			return;
		}
		const existingOrCreated = existing || newItemFactory( key );
		map.set( key, existingOrCreated );
		return existingOrCreated;
	};
};

export const getReflectionVueCategory = makeAutoGenRegistry<Reflection, ReflectionCategory>( () => new ReflectionCategory( 'Vue' ) );