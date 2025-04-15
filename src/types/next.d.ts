// src/types/next.d.ts
export interface NextPageProps<T = string> {
  params: { id: T };
  searchParams?: { [key: string]: string | string[] | undefined };
}