"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReflectionCategory_1 = require("typedoc/dist/lib/models/ReflectionCategory");
exports.PLUGIN_NAME = 'typedoc-plugin-vue';
exports.addOrInitArray = (obj, prop, val) => {
    if (typeof obj[prop] === 'undefined' || Array.isArray(obj[prop])) {
        obj[prop] = [
            ...(obj[prop] || []),
            val,
        ];
    }
    else {
        throw new TypeError(`Invalid type for prop ${prop}`);
    }
};
exports.removeTag = (reflection, tag) => {
    const tags = reflection.comment.tags;
    tags.splice(tags.indexOf(tag), 1);
};
exports.makeAutoGenRegistry = (newItemFactory) => {
    const map = new Map();
    return (key, createIfNotExists) => {
        const existing = map.get(key);
        if (!existing && !createIfNotExists) {
            return;
        }
        const existingOrCreated = existing || newItemFactory(key);
        map.set(key, existingOrCreated);
        return existingOrCreated;
    };
};
exports.getReflectionVueCategory = exports.makeAutoGenRegistry(() => new ReflectionCategory_1.ReflectionCategory('Vue'));
//# sourceMappingURL=utils.js.map