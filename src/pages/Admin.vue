<script setup>
import { ref, onMounted, inject } from 'vue'
import { supabase } from '../supabase'
import { VERTICALS, PROVIDER_TYPES, labelForProvider } from '../utils'
import { useRouter } from 'vue-router'

const form = ref({
  vertical: '',
  provider_type: '',
  stake: '',
  cheki: '',
  cheki_to: '',
  rolling_reserve: false,
  insurance: false,
  settlement: '',
  date: ''
})

const rows = ref([])
const error = ref('')
const loading = ref(false)

const isAdmin = inject('isAdmin')
const router = useRouter()

async function load() {
  loading.value = true
  error.value = ''
  try {
    const { data, error: err } = await supabase
      .from('offers')
      .select('*')
      .order('date', { ascending: false })
    if (err) throw err
    rows.value = data || []
  } catch (e) {
    error.value = e?.message || String(e)
  } finally {
    loading.value = false
  }
}

async function submit() {
  const payload = {
    vertical: form.value.vertical || null,
    provider_type: form.value.provider_type || null,
    stake: form.value.stake !== '' ? Number(form.value.stake) : null,
    cheki: form.value.cheki !== '' ? Number(form.value.cheki) : null,
    cheki_to: form.value.cheki_to !== '' ? Number(form.value.cheki_to) : null,
    rolling_reserve: !!form.value.rolling_reserve,
    insurance: !!form.value.insurance,
    settlement: form.value.settlement || null,
    date: form.value.date || null
  }

  const { error: err } = await supabase.from('offers').insert([payload])
  if (err) {
    alert('Ошибка сохранения: ' + err.message)
  } else {
    form.value = {
      vertical: '',
      provider_type: '',
      stake: '',
      cheki: '',
      cheki_to: '',
      rolling_reserve: false,
      insurance: false,
      settlement: '',
      date: ''
    }
    await load()
  }
}

async function removeOffer(id) {
  if (!confirm('Удалить оффер?')) return
  const { error: err } = await supabase.from('offers').delete().eq('id', id)
  if (err) {
    alert('Ошибка удаления: ' + err.message)
  } else {
    rows.value = rows.value.filter(o => o.id !== id)
  }
}

function logout() {
  isAdmin.value = false
  localStorage.removeItem('isAdmin')
  router.push('/login')
}

onMounted(load)
</script>

<template>
  <div class="grid grid-cols-2">
    <div class="card">
      <h2 style="margin-top:0">Добавить оффер</h2>
      <div class="grid" style="grid-template-columns:1fr 1fr; gap:12px">
        <div>
          <label class="small">Вертикаль</label>
          <select class="select" v-model="form.vertical">
            <option value="">Не выбрано</option>
            <option v-for="v in VERTICALS" :key="v" :value="v">{{ v }}</option>
          </select>
        </div>
        <div>
          <label class="small">Тип поставщика</label>
          <select class="select" v-model="form.provider_type">
            <option value="">Не выбрано</option>
            <option v-for="p in PROVIDER_TYPES" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
        </div>
        <div>
          <label class="small">Ставка, %</label>
          <input class="input" v-model="form.stake" type="number" step="0.01" />
        </div>
        <div>
          <label class="small">Чеки от</label>
          <input class="input" v-model="form.cheki" type="number" step="0.01" />
        </div>
        <div>
          <label class="small">Чеки до</label>
          <input class="input" v-model="form.cheki_to" type="number" step="0.01" />
        </div>
        <div>
          <label class="small">Роллинг резерв</label><br />
          <label><input type="checkbox" v-model="form.rolling_reserve" /> Да</label>
        </div>
        <div>
          <label class="small">Страховой</label><br />
          <label><input type="checkbox" v-model="form.insurance" /> Да</label>
        </div>
        <div>
          <label class="small">Settlement</label>
          <input class="input" v-model="form.settlement" type="text" />
        </div>
        <div>
          <label class="small">Дата</label>
          <input class="input" v-model="form.date" type="date" />
        </div>
      </div>
      <div style="margin-top:12px">
        <button class="btn btn-primary" @click="submit">Сохранить</button>
      </div>
    </div>

    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h2 style="margin-top:0">Список офферов</h2>
        <button class="btn" @click="logout">Выйти</button>
      </div>
      <p v-if="loading">Загрузка…</p>
      <p v-else-if="rows.length===0" class="small">Нет офферов</p>
      <div v-else style="overflow:auto">
        <table class="table">
          <thead>
            <tr>
              <th>ID внутр.</th>
              <th>Вертикаль</th>
              <th>Тип</th>
              <th>Ставка %</th>
              <th>Чеки от</th>
              <th>Чеки до</th>
              <th>Ролл.резерв</th>
              <th>Страховой</th>
              <th>Settlement</th>
              <th>Дата</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in rows" :key="o.id">
              <td>{{ o.internal_id }}</td>
              <td>{{ o.vertical }}</td>
              <td><span class="badge">{{ labelForProvider(o.provider_type) }}</span></td>
              <td>{{ o.stake }}</td>
              <td>{{ o.cheki }}</td>
              <td>{{ o.cheki_to }}</td>
              <td>{{ o.rolling_reserve ? 'Да' : 'Нет' }}</td>
              <td>{{ o.insurance ? 'Да' : 'Нет' }}</td>
              <td>{{ o.settlement || '' }}</td>
              <td>{{ o.date || '' }}</td>
              <td>
                <button class="btn btn-danger small" @click="removeOffer(o.id)">Удалить</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="error" class="small" style="color:#ff7a7a">{{ error }}</p>
    </div>
  </div>
</template>
