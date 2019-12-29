"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("typedoc/dist/lib/models");
exports.getKindStr = (kind) => { var _a; return (_a = Object.entries(models_1.ReflectionKind).find(([, v]) => v === kind)) === null || _a === void 0 ? void 0 : _a[0]; };
exports.filterTags = (reflection, tagName, constraintHost, single) => {
    var _a, _b, _c;
    const matchedTags = (_c = (_b = (_a = reflection.comment) === null || _a === void 0 ? void 0 : _a.tags) === null || _b === void 0 ? void 0 : _b.filter(t => t.tagName === tagName), (_c !== null && _c !== void 0 ? _c : []));
    // If no tags, exit now
    if (matchedTags.length === 0) {
        return [];
    }
    // Ensure it is used correctly
    // On host
    const constraintHosts = Array.isArray(constraintHost) ? constraintHost : [constraintHost];
    if (!constraintHosts.includes(reflection.kind)) {
        const constraintHostsStrs = constraintHosts.map(exports.getKindStr);
        const constraintStr = constraintHostsStrs.length === 1 ? constraintHostsStrs : `one of [${constraintHostsStrs.join(', ')}]`;
        const kindStr = exports.getKindStr(reflection.kind);
        throw new SyntaxError(`@${tagName} tag can only be used on ${constraintStr}, but it is used on ${kindStr} (${reflection.kind})`);
    }
    // Ensure there is a single tag if the option is set.
    if (single && matchedTags.length > 1) {
        throw new SyntaxError(`Expected a single @${tagName} tag.`);
    }
    return matchedTags;
};
//# sourceMappingURL=filters.js.map