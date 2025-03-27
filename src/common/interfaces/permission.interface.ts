import { Action } from "@/common/enums/action.enum";

export interface IPermission {
    action: Action;
    subject: string;
}