<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold mb-2">🌐 IPアドレスチェック</h1>
      <p class="text-base-content/70">IP/CIDR形式の検証、ネットワーク重複の確認</p>
    </div>

    <!-- Mode Selection -->
    <div class="tabs tabs-boxed justify-center mb-6">
      <a 
        class="tab" 
        :class="{ 'tab-active': mode === 'single' }"
        @click="mode = 'single'"
      >
        単一チェック
      </a>
      <a 
        class="tab" 
        :class="{ 'tab-active': mode === 'compare' }"
        @click="mode = 'compare'"
      >
        比較モード
      </a>
    </div>

    <!-- Single Mode -->
    <div v-if="mode === 'single'" class="space-y-6">
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">IPを含むテキストを貼り付け</span>
          <span class="label-text-alt">有効なIP/CIDRを自動抽出</span>
        </label>
        <textarea
          v-model="input1"
          class="textarea textarea-bordered h-48 font-mono text-sm"
          placeholder="任意のテキストを貼り付け、IP/CIDRを自動抽出&#10;例：&#10;192.168.1.0/24&#10;10.0.0.1&#10;172.16.0.0/16"
        ></textarea>
      </div>

      <div class="flex justify-center gap-4">
        <button @click="checkSingle" class="btn btn-primary" :disabled="!input1.trim()">
          🔍 チェック
        </button>
        <button @click="clearAll" class="btn btn-ghost">
          🗑️ クリア
        </button>
      </div>
    </div>

    <!-- Compare Mode -->
    <div v-if="mode === 'compare'" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">IP設定1</span>
          </label>
          <textarea
            v-model="input1"
            class="textarea textarea-bordered h-40 font-mono text-sm"
            placeholder="1つ目のIPリストを貼り付け"
          ></textarea>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">IP設定2</span>
          </label>
          <textarea
            v-model="input2"
            class="textarea textarea-bordered h-40 font-mono text-sm"
            placeholder="2つ目のIPリストを貼り付けて比較"
          ></textarea>
        </div>
      </div>

      <div class="flex justify-center gap-4">
        <button @click="checkCompare" class="btn btn-primary" :disabled="!input1.trim() || !input2.trim()">
          🔍 比較
        </button>
        <button @click="clearAll" class="btn btn-ghost">
          🗑️ クリア
        </button>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="result" class="mt-8 space-y-6">
      <div class="divider">チェック結果</div>

      <!-- Invalid IPs Warning -->
      <div v-if="result.invalidStrings && result.invalidStrings.length > 0" class="alert alert-warning">
        <span>🟡 以下の {{ result.invalidStrings.length }} 件の無効なIPは無視されました：</span>
        <code class="ml-2">{{ result.invalidStrings.join(', ') }}</code>
      </div>

      <!-- Valid IPs Count -->
      <div v-if="result.validNetworks" class="alert alert-info">
        <span>ℹ️ {{ result.validNetworks.length }} 件の有効なIP/CIDRを抽出しました</span>
      </div>

      <!-- No Valid IPs -->
      <div v-if="result.validNetworks && result.validNetworks.length === 0" class="alert alert-error">
        <span>❌ 有効なIPアドレスが見つかりませんでした</span>
      </div>

      <!-- Overlapping Check -->
      <div v-if="result.overlappingPairs">
        <div v-if="result.overlappingPairs.length === 0" class="alert alert-success">
          <span>✅ 重複するIP範囲はありませんでした</span>
        </div>
        <div v-else class="alert alert-warning shadow-lg">
          <div>
            <span>⚠️ {{ result.overlappingPairs.length }} 組の重複するIP範囲が見つかりました：</span>
            <ul class="list-disc list-inside mt-2">
              <li v-for="(pair, index) in result.overlappingPairs" :key="index">
                <code>{{ pair[0] }}</code> と <code>{{ pair[1] }}</code> が重複
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Valid Networks List -->
      <div v-if="result.validNetworks && result.validNetworks.length > 0" class="collapse collapse-arrow bg-base-200">
        <input type="checkbox" />
        <div class="collapse-title font-medium">
          📋 有効なIP/CIDRリスト（{{ result.validNetworks.length }} 件）
        </div>
        <div class="collapse-content">
          <div class="result-box">
            <p v-for="net in result.validNetworks" :key="net.original">{{ net.original }}</p>
          </div>
        </div>
      </div>

      <!-- Comparison Results -->
      <div v-if="result.comparison" class="space-y-4">
        <div class="divider">比較結果</div>

        <!-- Stats -->
        <div class="stats stats-vertical md:stats-horizontal shadow w-full">
          <div class="stat">
            <div class="stat-title">設定1</div>
            <div class="stat-value text-primary">{{ result.comparison.totalFirst }}</div>
          </div>
          <div class="stat">
            <div class="stat-title">設定2</div>
            <div class="stat-value text-secondary">{{ result.comparison.totalSecond }}</div>
          </div>
          <div class="stat">
            <div class="stat-title">共通</div>
            <div class="stat-value text-info">{{ result.comparison.common.length }}</div>
          </div>
        </div>

        <!-- Identical -->
        <div v-if="result.comparison.identical" class="alert alert-success">
          <span>✅ 2つのIP設定は完全に一致しています！</span>
        </div>

        <!-- Common -->
        <div v-if="result.comparison.common.length > 0" class="collapse collapse-arrow bg-info/10 border border-info">
          <input type="checkbox" />
          <div class="collapse-title font-medium">
            📊 共通のIP（{{ result.comparison.common.length }} 件）
          </div>
          <div class="collapse-content">
            <div class="result-box">
              <p v-for="ip in result.comparison.common" :key="ip">{{ ip }}</p>
            </div>
          </div>
        </div>

        <!-- Only in First -->
        <div v-if="result.comparison.onlyInFirst.length > 0" class="collapse collapse-arrow bg-error/10 border border-error">
          <input type="checkbox" checked />
          <div class="collapse-title font-medium">
            🔴 設定1のみ（{{ result.comparison.onlyInFirst.length }} 件）
          </div>
          <div class="collapse-content">
            <div class="result-box">
              <p v-for="ip in result.comparison.onlyInFirst" :key="ip">{{ ip }}</p>
            </div>
          </div>
        </div>

        <!-- Only in Second -->
        <div v-if="result.comparison.onlyInSecond.length > 0" class="collapse collapse-arrow bg-primary/10 border border-primary">
          <input type="checkbox" checked />
          <div class="collapse-title font-medium">
            🔵 設定2のみ（{{ result.comparison.onlyInSecond.length }} 件）
          </div>
          <div class="collapse-content">
            <div class="result-box">
              <p v-for="ip in result.comparison.onlyInSecond" :key="ip">{{ ip }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { extractAndCheckIps, compareIpSets } from '../utils/ipUtils'

const mode = ref('single')
const input1 = ref('')
const input2 = ref('')
const result = ref(null)

function checkSingle() {
  const checkResult = extractAndCheckIps(input1.value)
  result.value = checkResult
}

function checkCompare() {
  const result1 = extractAndCheckIps(input1.value)
  const result2 = extractAndCheckIps(input2.value)
  
  const comparison = compareIpSets(result1.validNetworks, result2.validNetworks)
  
  result.value = {
    ...result1,
    result2: result2,
    comparison: comparison
  }
}

function clearAll() {
  input1.value = ''
  input2.value = ''
  result.value = null
}
</script>
