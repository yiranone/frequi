const pairTemplates = ref([
  {
    description: '全部 USDT 现货交易对',
    pairs: ['.*/USDT'],
  },
  {
    description: '全部 USDT 合约交易对',
    pairs: ['.*/USDT:USDT'],
  },
]);

export function usePairTemplates() {
  return {
    pairTemplates: computed(() => pairTemplates.value.map((x, idx) => ({ ...x, idx }))),
  };
}
