"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsertChange = void 0;
class InsertChange {
    constructor(path, pos, toAdd) {
        this.path = path;
        this.pos = pos;
        this.toAdd = toAdd;
        this.description = `Inserted ${toAdd} into ${path} at ${pos}`;
        this.order = pos;
    }
    apply(host) {
        return host.insertLeft(this.pos, this.toAdd);
    }
}
exports.InsertChange = InsertChange;
//# sourceMappingURL=change.js.map