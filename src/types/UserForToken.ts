export interface UserForToken {
  id: number;
  email: string;
  rol: string;
  institutionId?: number;
  nombre?: string;
  apellido?: string;
  dni?: string;
  institucion_origen?: string;
}