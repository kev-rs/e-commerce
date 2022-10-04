import useSWR, { SWRConfiguration } from 'swr';
import { SeedProduct } from '../db'

export const useProduct = (url: string, config: SWRConfiguration = {}) => {
  const { data, error } = useSWR<SeedProduct[]>(`/api${url}`, config)

  return {
    products: data || [],
    isLoading: !data && !error,
    error,
  }
}