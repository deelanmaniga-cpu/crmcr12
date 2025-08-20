export const VERTICALS = [
  'gambling','exchange','exchange bestchange','forex','betting','adult','mix'
]

export const PROVIDER_TYPES = [
  { value: 'provider', label: 'провайдер' },
  { value: 'direct_merchant', label: 'прямой мерчант' },
  { value: 'aggregator_provider', label: 'агрегатор провайдер' },
  { value: 'aggregator_merchant', label: 'агрегатор мерчант' },
]

export function labelForProvider(value){
  const f = PROVIDER_TYPES.find(x=>x.value===value)
  return f ? f.label : value || ''
}
