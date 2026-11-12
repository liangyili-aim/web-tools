<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold mb-2">📧 メールリスト照合</h1>
      <p class="text-base-content/70">2つのメールリストを比較し、重複と新規を検出します</p>
    </div>

    <!-- Input Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- First List -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">リスト1（例：Google Groupメンバー）</span>
          <span class="label-text-alt">{{ list1Count }} 件</span>
        </label>
        <textarea
          v-model="list1Text"
          class="textarea textarea-bordered h-48 font-mono text-sm"
          placeholder="メールリストを貼り付け（カンマ、セミコロン、改行で区切り可）&#10;例：&#10;user1@example.com&#10;user2@example.com, user3@example.com"
        ></textarea>
      </div>

      <!-- Second List -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">リスト2（比較対象のメール）</span>
          <span class="label-text-alt">{{ list2Count }} 件</span>
        </label>
        <textarea
          v-model="list2Text"
          class="textarea textarea-bordered h-48 font-mono text-sm"
          placeholder="比較したいメールリストを貼り付け&#10;重複と新規を自動検出します"
        ></textarea>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-center gap-4 mb-8">
      <button @click="compare" class="btn btn-primary" :disabled="!canCompare">
        🔍 照合開始
      </button>
      <button @click="clear" class="btn btn-ghost">
        🗑️ クリア
      </button>
    </div>

    <!-- Results Section -->
    <div v-if="result" class="space-y-6">
      <div class="divider">照合結果</div>

      <!-- Summary Stats -->
      <div class="stats stats-vertical md:stats-horizontal shadow w-full">
        <div class="stat">
          <div class="stat-figure text-primary">📋</div>
          <div class="stat-title">リスト1</div>
          <div class="stat-value text-primary">{{ result.list1Count }}</div>
        </div>
        <div class="stat">
          <div class="stat-figure text-secondary">📋</div>
          <div class="stat-title">リスト2</div>
          <div class="stat-value text-secondary">{{ result.list2Count }}</div>
        </div>
        <div class="stat">
          <div class="stat-figure text-warning">⚠️</div>
          <div class="stat-title">重複</div>
          <div class="stat-value text-warning">{{ result.duplicates.length }}</div>
        </div>
        <div class="stat">
          <div class="stat-figure text-success">✨</div>
          <div class="stat-title">新規</div>
          <div class="stat-value text-success">{{ result.newEmails.length }}</div>
        </div>
      </div>

      <!-- Gmail Warning -->
      <div v-if="gmailEmails.length > 0" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <div>
          <span class="font-bold">⚠️ Gmail検出：</span>
          <span>{{ gmailEmails.length }} 件の @gmail.com アドレスが見つかりました</span>
          <div class="text-sm mt-1 opacity-80">{{ gmailEmails.join(', ') }}</div>
        </div>
      </div>

      <!-- Duplicates -->
      <div v-if="result.duplicates.length > 0" class="collapse collapse-arrow bg-warning/10 border border-warning">
        <input type="checkbox" checked />
        <div class="collapse-title font-medium">
          ⚠️ 重複メール（{{ result.duplicates.length }} 件）
        </div>
        <div class="collapse-content">
          <div class="result-box">
            <p v-for="email in result.duplicates" :key="email">{{ email }}</p>
          </div>
          <button @click="copyToClipboard(result.duplicates)" class="btn btn-sm btn-outline mt-2">
            📋 コピー
          </button>
        </div>
      </div>

      <!-- New Emails -->
      <div v-if="result.newEmails.length > 0" class="collapse collapse-arrow bg-success/10 border border-success">
        <input type="checkbox" checked />
        <div class="collapse-title font-medium">
          ✨ 新規メール（{{ result.newEmails.length }} 件）
        </div>
        <div class="collapse-content">
          <div class="result-box">
            <p v-for="email in result.newEmails" :key="email">{{ email }}</p>
          </div>
          <div class="flex gap-2 mt-2 flex-wrap">
            <button @click="copyToClipboard(result.newEmails)" class="btn btn-sm btn-outline">
              📋 コピー
            </button>
            <button @click="copyForJenkins(result.newEmails)" class="btn btn-sm btn-outline btn-info">
              🔧 Jenkins用コピー
            </button>
            <button @click="downloadNewEmails" class="btn btn-sm btn-outline btn-success">
              💾 CSVダウンロード
            </button>
          </div>
        </div>
      </div>

      <!-- No Duplicates Message -->
      <div v-if="result.duplicates.length === 0" class="alert alert-info">
        <span>ℹ️ 重複するメールはありませんでした</span>
      </div>

      <!-- Only in List 1 -->
      <div v-if="result.notInList2.length > 0" class="collapse collapse-arrow bg-base-200">
        <input type="checkbox" />
        <div class="collapse-title font-medium">
          📋 リスト1のみ（{{ result.notInList2.length }} 件）
        </div>
        <div class="collapse-content">
          <div class="result-box">
            <p v-for="email in result.notInList2" :key="email">{{ email }}</p>
          </div>
          <button @click="copyToClipboard(result.notInList2)" class="btn btn-sm btn-outline mt-2">
            📋 コピー
          </button>
        </div>
      </div>

      <!-- Identical Lists Message -->
      <div v-if="result.duplicates.length > 0 && result.newEmails.length === 0 && result.notInList2.length === 0" class="alert alert-success">
        <span>✅ 2つのリストは完全に一致しています！</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { extractEmailsRegex, compareEmailLists, downloadEmailsAsCsv } from '../utils/emailUtils'

const list1Text = ref('')
const list2Text = ref('')
const result = ref(null)

const list1Count = computed(() => extractEmailsRegex(list1Text.value).size)
const list2Count = computed(() => extractEmailsRegex(list2Text.value).size)
const canCompare = computed(() => list1Count.value > 0 || list2Count.value > 0)

// Detect gmail addresses in new emails
const gmailEmails = computed(() => {
  if (!result.value) return []
  const allEmails = [...result.value.newEmails, ...result.value.duplicates]
  return allEmails.filter(email => email.endsWith('@gmail.com'))
})

function compare() {
  const list1 = extractEmailsRegex(list1Text.value)
  const list2 = extractEmailsRegex(list2Text.value)
  result.value = compareEmailLists(list1, list2)
}

function clear() {
  list1Text.value = ''
  list2Text.value = ''
  result.value = null
}

function copyToClipboard(items) {
  navigator.clipboard.writeText(items.join('\n'))
}

function copyForJenkins(items) {
  // Add comma at end of each line except the last one for Jenkins mailing list
  const formatted = items.map((email, index) => 
    index < items.length - 1 ? email + ',' : email
  )
  navigator.clipboard.writeText(formatted.join('\n'))
}

function downloadNewEmails() {
  if (result.value && result.value.newEmails.length > 0) {
    downloadEmailsAsCsv(result.value.newEmails, 'new-emails.csv')
  }
}
</script>
