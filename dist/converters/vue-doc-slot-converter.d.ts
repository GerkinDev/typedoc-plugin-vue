import { Context } from 'typedoc/dist/lib/converter';
import { ConverterComponent } from 'typedoc/dist/lib/converter/components';
import { Reflection } from 'typedoc/dist/lib/models';
import { ReflectionGroup } from 'typedoc/dist/lib/models/ReflectionGroup';
export declare class VueDocSlotConverter extends ConverterComponent {
    private static readonly _groupFor;
    static groupFor(reflection: Reflection): ReflectionGroup | undefined;
    protected initialize(): void;
    private static slotReflectionFromData;
    onResolveReflection(context: Context, reflection: Reflection): void;
}
//# sourceMappingURL=vue-doc-slot-converter.d.ts.map