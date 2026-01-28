<template>
  <header class="navbar bg-base-100 shadow-lg">
    <div class="container mx-auto">
      <div class="flex-1">
        <router-link to="/" class="btn btn-ghost text-xl">
          🛠️ Web Tools
        </router-link>
      </div>
      <div class="flex-none">
        <ul class="menu menu-horizontal px-1">
          <li>
            <router-link to="/email-checker" class="tooltip tooltip-bottom" data-tip="メール照合">
              📧 メール
            </router-link>
          </li>
          <li>
            <router-link to="/ip-checker" class="tooltip tooltip-bottom" data-tip="IPチェック">
              🌐 IP
            </router-link>
          </li>
          <li>
            <router-link to="/pwd-generator" class="tooltip tooltip-bottom" data-tip="パスワード生成">
              🔐 パスワード
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup>
</script>
