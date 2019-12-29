import { Context } from 'typedoc/dist/lib/converter';
import { ConverterComponent } from 'typedoc/dist/lib/converter/components';
import { DeclarationReflection, Reflection } from 'typedoc/dist/lib/models';
import { ReflectionGroup } from 'typedoc/dist/lib/models/ReflectionGroup';
export declare class VueDocPropConverter extends ConverterComponent {
    private static readonly _groupFor;
    static groupFor(reflection: DeclarationReflection): ReflectionGroup | undefined;
    protected initialize(): void;
    onResolveReflection(context: Context, reflection: Reflection): void;
}
//# sourceMappingURL=vue-doc-prop-converter.d.ts.map