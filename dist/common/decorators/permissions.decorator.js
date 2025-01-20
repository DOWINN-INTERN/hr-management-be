"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permissions = void 0;
const common_1 = require("@nestjs/common");
const Permissions = (...permissions) => (0, common_1.SetMetadata)('permissions', permissions);
exports.Permissions = Permissions;
