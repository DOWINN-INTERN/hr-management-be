"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuard = void 0;
class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const roles = this.reflector.get('roles', context.getHandler());
        if (!roles) {
            return true; // If no roles are defined, allow access
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user; // Assuming user is attached to the request
        return user && user.roles && this.matchRoles(roles, user.roles);
    }
    matchRoles(roles, userRoles) {
        return roles.some(role => userRoles.includes(role));
    }
}
exports.RolesGuard = RolesGuard;
