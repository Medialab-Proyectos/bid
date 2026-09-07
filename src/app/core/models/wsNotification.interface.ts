export interface WsNotification {
    user: string;
    type: WsNotificationType;
    messageTranslationKey: string;
    operationNumber: string;
}
export enum WsNotificationType {
    SuccessMessage = 'SuccessMessage'
}
