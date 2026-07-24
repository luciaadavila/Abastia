export interface Almacenamiento {
  lugar: string;
  diasCaducidadEstimados: number;
}

export interface Product {
  _id?: string;
  nombre: string;
  marca?: string;
  categoria: string;
  imagen?: string;
  unidadMedida: string;
  lugaresAlmacenamiento: Almacenamiento[];
  lugarPorDefecto: string;
  enDespensa: boolean;

  createdAt?: string;
  updatedAt?: string;
}
