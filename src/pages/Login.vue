<script setup>
import { inject, ref } from 'vue'
import { useRouter } from 'vue-router'

const isAdmin = inject('isAdmin')
const router = useRouter()
const pwd = ref('')
const error = ref('')

function submit() {
  error.value = ''
  if (pwd.value === 'admin23') {
    isAdmin.value = true
    localStorage.setItem('isAdmin', 'true') // сохраняем
    router.push('/admin')
  } else {
    error.value = 'Неверный пароль'
  }
}
</script>

<template>
  <div class="grid" style="max-width:420px;margin:40px auto">
    <div class="card">
      <h2 style="margin-top:0">Вход</h2>
      <input
        class="input"
        type="password"
        v-model="pwd"
        placeholder="Пароль"
        @keyup.enter="submit"
      />
      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn btn-primary" @click="submit">Войти</button>
      </div>
      <p v-if="error" class="small" style="color:#ff7a7a;margin-top:8px">{{ error }}</p>
    </div>
  </div>
</template>
