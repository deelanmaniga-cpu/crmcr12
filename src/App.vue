<script setup>
import { inject } from 'vue'
import { useRouter } from 'vue-router'

const isAdmin = inject('isAdmin')
const r = useRouter()
const goLogin = () => r.push('/login')
const goHome = () => r.push('/')
const goAdmin = () => r.push('/admin')
</script>

<template>
  <header class="header">
    <div class="brand" @click="goHome" style="cursor:pointer">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 12l9-9 9 9-9 9-9-9z" stroke="#7fc1ff" stroke-width="2"/></svg>
      <h1>CRM Offers</h1>
    </div>
    <div style="display:flex; gap:10px">
     <button class="btn" @click="goHome">Поиск</button>
<button class="btn" @click="goAdmin">Админ</button>
<button v-if="isAdmin.value" class="btn btn-danger" @click="isAdmin.value=false">Выйти</button>

    </div>
  </header>
  <div class="container">
    <router-view />
  </div>
</template>
