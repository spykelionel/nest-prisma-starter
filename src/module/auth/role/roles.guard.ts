import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AccountType } from "@prisma/client";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<
      (AccountType | string)[]
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.roles || !user.accountType) {
      throw new UnauthorizedException(
        "You are not authorized to access this resource"
      );
    }

    if (user?.isAdmin) {
      return true;
    }
    // Check if the user has the required role and permissions
    const hasRoleWithPermissions = user.roles.some((role: any) => {
      const roleNameMatches = requiredRoles.includes(role?.name);
      const hasReservationPermissions =
        role.permissions?.reservations?.length > 0;

      // Now check if the user has the required role and permissions
      const hasFloorPlanPermissions = role.permissions?.floorPlans?.length > 0;

      const hasGuestPermissions = role.permissions?.guests?.length > 0;

      const hasSettingPermissions = role.permissions?.settings?.length > 0;

      return roleNameMatches && hasReservationPermissions;
    });

    const hasRole =
      user.roles.some((role: any) => requiredRoles.includes(role?.name)) ||
      requiredRoles.includes(user.accountType);

    if (!hasRole) {
      throw new ForbiddenException(
        `${user.firstName}, you do not have permission to access this resource!`
      );
    }

    return true;
  }
}
