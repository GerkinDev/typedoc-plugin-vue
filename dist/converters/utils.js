"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("typedoc/dist/lib/models");
const filters_1 = require("./filters");
exports.getKindStr = (kind) => { var _a; return (_a = Object.entries(models_1.ReflectionKind).find(([, v]) => v === kind)) === null || _a === void 0 ? void 0 : _a[0]; };
const tagRegex = /^(\S+)\s+(\S+)\s+(?:<(.+?)>\s+)?-\s+(.*$)/;
exports.parseVirtFnParamTag = (tag) => {
    const text = tag.text.trim();
    const matches = text.match(tagRegex);
    if (!matches) {
        throw new SyntaxError(`Tag of type ${tag.tagName} has incorrect text "${text}"`);
    }
    return {
        paramDesc: matches[4],
        paramName: matches[2],
        paramType: matches[3],
        virtFnName: matches[1],
    };
};
exports.parseVirtFn = (reflection, virtFnId, kind) => {
    const virtFnTags = filters_1.filterTags(reflection, virtFnId, kind, false);
    if (virtFnTags.length === 0) {
        return [];
    }
    const virtFnParamsTags = filters_1.filterTags(reflection, virtFnId + '-param', kind, false);
    // Extract virtual functions parameter infos
    const virtFnParamInfos = virtFnParamsTags
        .map(tag => (Object.assign(Object.assign({}, exports.parseVirtFnParamTag(tag)), { tag })));
    // Aggregate parameters & virtual functions declarations
    const virtFnInfos = virtFnTags
        .map(tag => {
        const tagTextParts = tag.text.split(/\s/);
        return {
            description: tagTextParts.slice(1).join(' ').trim(),
            name: tagTextParts[0].trim(),
            tag,
        };
    })
        .map(virtFnInfo => (Object.assign(Object.assign({}, virtFnInfo), { params: virtFnParamInfos
            // Only params of this virtual function
            .filter(virtFnParam => virtFnParam.virtFnName === virtFnInfo.name)
            .map(virtFnParam => ({
            description: virtFnParam.paramDesc,
            name: virtFnParam.paramName,
            tag: virtFnParam.tag,
            type: virtFnParam.paramType,
        })) })));
    return virtFnInfos;
};
//# sourceMappingURL=utils.js.map