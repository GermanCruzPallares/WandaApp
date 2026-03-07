

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Puedes añadir más variables de entorno aquí en el futuro si lo necesitas
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}