<template>
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-4">🛠️ Web Tools</h1>
      <p class="text-lg text-base-content/70">便利なツール集</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Email Checker Card -->
      <router-link to="/email-checker" class="tool-card">
        <div class="card-body items-center text-center">
          <div class="text-5xl mb-4">📧</div>
          <h2 class="card-title">メール照合</h2>
          <p class="text-base-content/70">2つのメールリストを比較し、重複と新規を検出</p>
          <div class="card-actions mt-4">
            <button class="btn btn-primary btn-sm">使ってみる</button>
          </div>
        </div>
      </router-link>

      <!-- IP Checker Card -->
      <router-link to="/ip-checker" class="tool-card">
        <div class="card-body items-center text-center">
          <div class="text-5xl mb-4">🌐</div>
          <h2 class="card-title">IPチェック</h2>
          <p class="text-base-content/70">IP/CIDR形式の検証、ネットワーク重複の確認</p>
          <div class="card-actions mt-4">
            <button class="btn btn-primary btn-sm">使ってみる</button>
          </div>
        </div>
      </router-link>

      <!-- Password Generator Card -->
      <router-link to="/pwd-generator" class="tool-card">
        <div class="card-body items-center text-center">
          <div class="text-5xl mb-4">🔐</div>
          <h2 class="card-title">パスワード生成</h2>
          <p class="text-base-content/70">安全なランダムパスワードを生成、一括生成とCSV出力対応</p>
          <div class="card-actions mt-4">
            <button class="btn btn-primary btn-sm">使ってみる</button>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Features Section -->
    <!-- <div class="mt-12">
      <h2 class="text-2xl font-bold text-center mb-6">特徴</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex items-center gap-3 p-4 bg-base-100 rounded-lg shadow">
          <span class="text-2xl">🔒</span>
          <div>
            <h3 class="font-semibold">プライバシー優先</h3>
            <p class="text-sm text-base-content/70">すべてのデータ処理はブラウザ内で完結</p>
          </div>
        </div>
        <div class="flex items-center gap-3 p-4 bg-base-100 rounded-lg shadow">
          <span class="text-2xl">⚡</span>
          <div>
            <h3 class="font-semibold">高速・便利</h3>
            <p class="text-sm text-base-content/70">インストール不要、ブラウザですぐに使用可能</p>
          </div>
        </div>
        <div class="flex items-center gap-3 p-4 bg-base-100 rounded-lg shadow">
          <span class="text-2xl">📱</span>
          <div>
            <h3 class="font-semibold">レスポンシブデザイン</h3>
            <p class="text-sm text-base-content/70">スマホ、タブレット、デスクトップに対応</p>
          </div>
        </div>
        <div class="flex items-center gap-3 p-4 bg-base-100 rounded-lg shadow">
          <span class="text-2xl">💾</span>
          <div>
            <h3 class="font-semibold">エクスポート機能</h3>
            <p class="text-sm text-base-content/70">結果をCSVファイルとしてダウンロード可能</p>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup>
</script>
