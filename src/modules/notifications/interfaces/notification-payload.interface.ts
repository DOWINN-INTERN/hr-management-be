import { NotificationType } from "@/common/enums/notification-type.enum";

export interface NotificationPayload {
    id?: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
    read?: boolean;
    createdAt?: Date;
    targetType?: 'user' | 'group' | 'role' | 'department' | 'branch' | 'organization' | 'all';
    targetId?: string;
    metadata?: Record<string, any>;
}