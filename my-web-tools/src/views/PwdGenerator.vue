<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold mb-2">🔐 パスワード生成</h1>
      <p class="text-base-content/70">安全なランダムパスワードを生成、暗号学的に安全な乱数を使用</p>
    </div>

    <!-- Settings Card -->
    <div class="card bg-base-100 shadow-xl mb-8">
      <div class="card-body">
        <h2 class="card-title mb-4">⚙️ 生成設定</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Length -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">パスワード長</span>
              <span class="label-text-alt">{{ length }} 文字</span>
            </label>
            <input 
              type="range" 
              v-model.number="length" 
              min="6" 
              max="64" 
              class="range range-primary"
            />
            <div class="flex justify-between text-xs px-2 mt-1">
              <span>6</span>
              <span>18</span>
              <span>32</span>
              <span>48</span>
              <span>64</span>
            </div>
          </div>

          <!-- Count -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">生成数</span>
              <span class="label-text-alt">{{ count }} 件</span>
            </label>
            <input 
              type="range" 
              v-model.number="count" 
              min="1" 
              max="20" 
              class="range range-secondary"
            />
            <div class="flex justify-between text-xs px-2 mt-1">
              <span>1</span>
              <span>5</span>
              <span>10</span>
              <span>15</span>
              <span>20</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Special Characters -->
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text font-semibold">特殊文字を含む (!@#$%&*)</span>
              <input type="checkbox" v-model="useSpecial" class="toggle toggle-primary" />
            </label>
          </div>

          <!-- Min Special -->
          <div class="form-control" v-if="useSpecial">
            <label class="label">
              <span class="label-text font-semibold">最小特殊文字数</span>
              <span class="label-text-alt">{{ minSpecial }} 個</span>
            </label>
            <input 
              type="range" 
              v-model.number="minSpecial" 
              min="1" 
              max="5" 
              class="range range-accent"
            />
          </div>
        </div>

        <div class="card-actions justify-center mt-6">
          <button @click="generate" class="btn btn-primary btn-lg">
            🎲 パスワード生成
          </button>
        </div>
      </div>
    </div>

    <!-- Generated Passwords -->
    <div v-if="passwords.length > 0" class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex justify-between items-center mb-4">
          <h2 class="card-title">📋 生成結果</h2>
          <div class="flex gap-2">
            <button @click="copyAll" class="btn btn-sm btn-outline">
              📋 全てコピー
            </button>
            <button @click="downloadCsv" class="btn btn-sm btn-outline btn-success">
              💾 CSVダウンロード
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>#</th>
                <th>パスワード</th>
                <th>強度</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(pwd, index) in passwords" :key="index">
                <td>{{ index + 1 }}</td>
                <td>
                  <code class="text-lg font-mono">{{ pwd.password }}</code>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <progress 
                      class="progress w-20" 
                      :class="`progress-${pwd.strength.color}`"
                      :value="pwd.strength.score" 
                      :max="pwd.strength.maxScore"
                    ></progress>
                    <span class="text-xs capitalize">{{ pwd.strength.level }}</span>
                  </div>
                </td>
                <td>
                  <button @click="copyPassword(pwd.password)" class="btn btn-xs btn-ghost">
                    📋
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Info Card -->
    <div class="card bg-base-200 mt-8">
      <div class="card-body">
        <h3 class="card-title text-sm">💡 セキュリティ説明</h3>
        <ul class="text-sm text-base-content/70 list-disc list-inside space-y-1">
          <li>ブラウザ内蔵の <code>crypto.getRandomValues()</code> を使用して暗号学的に安全な乱数を生成</li>
          <li>紛らわしい文字を除外（0/O、1/l/I など）</li>
          <li>各パスワードには大文字、小文字、数字が最低1つずつ含まれます</li>
          <li>すべてのパスワード生成はローカルで完結し、サーバーにアップロードされません</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { generatePassword, calculateStrength, downloadAsCsv } from '../utils/pwdUtils'

const length = ref(18)
const count = ref(5)
const useSpecial = ref(true)
const minSpecial = ref(2)
const passwords = ref([])

function generate() {
  passwords.value = []
  
  for (let i = 0; i < count.value; i++) {
    const pwd = generatePassword({
      length: length.value,
      minSpecial: minSpecial.value,
      useSpecial: useSpecial.value
    })
    passwords.value.push({
      password: pwd,
      strength: calculateStrength(pwd)
    })
  }
}

function copyPassword(pwd) {
  navigator.clipboard.writeText(pwd)
}

function copyAll() {
  const allPwds = passwords.value.map(p => p.password).join('\n')
  navigator.clipboard.writeText(allPwds)
}

function downloadCsv() {
  const pwdList = passwords.value.map(p => p.password)
  downloadAsCsv(pwdList, 'passwords.csv')
}
</script>
