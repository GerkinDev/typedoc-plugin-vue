import { CommentTag, Reflection } from 'typedoc/dist/lib/models';
import { ReflectionCategory } from 'typedoc/dist/lib/models/ReflectionCategory';
export declare const PLUGIN_NAME = "typedoc-plugin-vue";
declare type Unpacked<T> = T extends Array<infer U> ? U : never;
export declare const addOrInitArray: <T, P extends keyof T>(obj: T, prop: P, val: Unpacked<T[P]>) => void;
export declare const removeTag: (reflection: Reflection, tag: CommentTag) => void;
export declare const makeAutoGenRegistry: <TKey, TVal>(newItemFactory: (key: TKey) => TVal) => ((reflection: TKey, createIfNotExists: true) => TVal) & ((reflection: TKey, createIfNotExists: false) => TVal | undefined);
export declare const getReflectionVueCategory: ((reflection: Reflection, createIfNotExists: true) => ReflectionCategory) & ((reflection: Reflection, createIfNotExists: false) => ReflectionCategory | undefined);
export {};
//# sourceMappingURL=utils.d.ts.map