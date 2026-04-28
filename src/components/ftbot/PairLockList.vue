<script setup lang="ts">
import type { Lock } from '@/types';

const botStore = useBotStore();

function removePairLock(item: Lock) {
  console.log(item);
  if (item.id !== undefined) {
    botStore.activeBot.deleteLock(item.id);
  } else {
    showAlert('当前 Freqtrade 版本不支持删除锁定。');
  }
}
</script>

<template>
  <div>
    <div class="mb-2">
      <label class="me-auto text-xl">交易对锁定</label>
      <Button class="float-end" severity="secondary" @click="botStore.activeBot.getLocks">
        <template #icon>
          <i-mdi-refresh />
        </template>
      </Button>
    </div>
    <div>
      <DataTable size="small" :value="botStore.activeBot.activeLocks">
        <Column field="pair" header="交易对"></Column>
        <Column field="lock_end_timestamp" header="锁定到">
          <template #body="{ data, field }">
            {{ timestampms(data[field as string]) }}
          </template>
        </Column>
        <Column field="reason" header="原因"></Column>
        <Column field="actions" header="操作">
          <template #body="{ data }">
            <Button
              class="btn-xs ms-1"
              size="small"
              severity="secondary"
              title="删除锁定"
              @click="removePairLock(data as Lock)"
            >
              <i-mdi-delete />
            </Button>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
