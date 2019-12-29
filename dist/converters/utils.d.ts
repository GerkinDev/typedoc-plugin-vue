import { Many } from 'lodash';
import { CommentTag, Reflection, ReflectionKind } from 'typedoc/dist/lib/models';
export declare const getKindStr: (kind: ReflectionKind) => string | undefined;
export declare const parseVirtFnParamTag: (tag: CommentTag) => {
    paramDesc: string;
    paramName: string;
    paramType: string | undefined;
    virtFnName: string;
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
export declare const parseVirtFn: (reflection: Reflection, virtFnId: string, kind: Many<ReflectionKind>) => IVirtFnDeclaration[];
//# sourceMappingURL=utils.d.ts.map