"use strict";
const converters_1 = require("./converters");
const vue_doc_renderer_1 = require("./vue-doc-renderer");
module.exports = (pluginHost) => {
    const app = pluginHost.owner;
    app.renderer.addComponent(vue_doc_renderer_1.VueDocRenderer.name, new vue_doc_renderer_1.VueDocRenderer(app.renderer));
    converters_1.converters.forEach(c => {
        console.log('Registering ', c.name);
        app.converter.addComponent(c.name, new c(app.converter));
    });
};
//# sourceMappingURL=index.js.map