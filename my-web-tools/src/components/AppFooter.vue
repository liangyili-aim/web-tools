<template>
  <footer class="footer footer-center p-4 bg-base-300 text-base-content mt-8">
    <aside>
      <p>{{ currentYear }} Web Tools - すべての処理はローカルで実行され、データはアップロードされません</p>
    </aside>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>
