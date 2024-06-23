export interface UserForToken {
    id: number;
    mail: string;
    rol: string;
    institutionId?: number;
    nombre?: string;
    apellido?: string;
    dni?: string;
}