// src/types/next.d.ts
import 'next';

declare module 'next' {
  export interface PageProps {
    params: { [key: string]: string | string[] }
    searchParams?: { [key: string]: string | string[] | undefined }
  }
}

declare module 'next/types' {
  export interface DefaultPageProps {
    params: { [key: string]: string | string[] }
    searchParams?: { [key: string]: string | string[] | undefined }
  }
}