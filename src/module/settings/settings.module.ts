import { Module } from "@nestjs/common";
import { RouterModule, Routes } from "@nestjs/core";
import { GuestModule } from "../guest/guest.module";
import { RoleModule } from "../role/role.module";
import { StaffProfileModule } from "../staff/staff.module";

const routes: Routes = [
  {
    path: "settings",
    children: [
      {
        path: "roles",
        module: RoleModule,
      },
      {
        path: "guests",
        module: GuestModule,
      },
      {
        path: "staffs",
        module: StaffProfileModule,
      },
    ],
  },
];

@Module({
  imports: [RouterModule.register(routes)],
  exports: [RouterModule],
})
export class SettingsModule {}
