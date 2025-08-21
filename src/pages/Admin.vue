<script setup>
import { inject, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { VERTICALS, PROVIDER_TYPES, labelForProvider } from '../utils'

const isAdmin = inject('isAdmin')
const router = useRouter()

// проверка логина
if (!isAdmin?.value || localStorage.getItem('isAdmin') !== 'true') {
  router.push('/login')
}

function logout() {
  isAdmin.value = false
  localStorage.removeItem('isAdmin')
  router.push('/login')
}

const loading = ref(false)
const rows = ref([])
const error = ref('')
const saveError = ref('')
const msg = ref('')

const form = ref({
  internal_id: '',
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

const filters = ref({
  cheki_from: '',
  cheki_to: ''
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    let query = supabase.from('offers').select('*').order('date', { ascending: false })

    if (filters.value.cheki_from !== '') {
      query = query.gte('cheki', Number(filters.value.cheki_from))
    }
    if (filters.value.cheki_to !== '') {
      query = query.lte('cheki_to', Number(filters.value.cheki_to))
    }

    const { data, error: err } = await query
    if (err) throw err
    rows.value = data || []
  } catch (e) {
    error.value = e?.message || String(e)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = {
    internal_id: '',
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
  msg.value = ''
  saveError.value = ''
}

async function save() {
  saveError.value = ''
  msg.value = ''
  try {
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
    if (form.value.internal_id !== '') {
      payload.internal_id = Number(form.value.internal_id)
    }
    const { error: err } = await supabase.from('offers').insert([payload])
    if (err) throw err
    msg.value = 'Сохранено'
    await load()
    resetForm()
  } catch (e) {
    saveError.value = e?.message || String(e)
  }
}

async function del(row) {
  try {
    const { error: err } = await supabase.from('offers').delete().eq('id', row.id)
    if (err) throw err
    await load()
  } catch (e) {
    alert('Ошибка удаления: ' + (e?.message || e))
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h1>Админка</h1>
      <button class="btn" @click="logout">Выйти</button>
    </div>

    <div class="grid grid-cols-2">
      <!-- Левая часть: форма -->
      <div class="card">
        <h2 style="margin-top:0">Добавить оффер</h2>
        <div class="grid" style="grid-template-columns:1fr 1fr; gap:12px">
          <div>
            <label class="small">Внутренний ID (необязательно)</label>
            <input
              class="input"
              v-model="form.internal_id"
              type="number"
              placeholder="если пусто — назначится автоматически"
            />
          </div>
          <div>
            <label class="small">Вертикаль</label>
            <select class="select" v-model="form.vertical">
              <option value="">— выбери —</option>
              <option v-for="v in VERTICALS" :key="v" :value="v">{{ v }}</option>
            </select>
          </div>
          <div>
            <label class="small">Тип поставщика</label>
            <select class="select" v-model="form.provider_type">
              <option value="">— выбери —</option>
              <option v-for="p in PROVIDER_TYPES" :key="p.value" :value="p.value">
                {{ p.label }}
              </option>
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
        <div style="margin-top:12px; display:flex; gap:10px">
          <button class="btn btn-primary" @click="save">Сохранить</button>
          <button class="btn" @click="resetForm">Очистить</button>
        </div>
        <p v-if="msg" class="small" style="color:#7dffa4;margin-top:8px">{{ msg }}</p>
        <p v-if="saveError" class="small" style="color:#ff7a7a;margin-top:8px">
          {{ saveError }}
        </p>
      </div>

      <!-- Правая часть: список -->
      <div class="card">
        <h2 style="margin-top:0">Список офферов</h2>

        <!-- Фильтры -->
        <div class="grid" style="grid-template-columns:1fr 1fr auto; gap:10px; margin-bottom:10px">
          <input class="input" type="number" v-model="filters.cheki_from" placeholder="Чеки от" />
          <input class="input" type="number" v-model="filters.cheki_to" placeholder="Чеки до" />
          <button class="btn" @click="load">Применить</button>
        </div>

        <div style="overflow:auto; max-height:60vh">
          <table class="table">
            <thead>
              <tr>
                <th>ID внутр.</th>
                <th>Вертикаль</th>
                <th>Тип</th>
                <th>Ставка</th>
                <th>Чеки от</th>
                <th>Чеки до</th>
                <th>RR</th>
                <th>Ins</th>
                <th>Дата</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in rows" :key="o.id">
                <td>{{ o.internal_id }}</td>
                <td>{{ o.vertical }}</td>
                <td>{{ labelForProvider(o.provider_type) }}</td>
                <td>{{ o.stake }}</td>
                <td>{{ o.cheki }}</td>
                <td>{{ o.cheki_to }}</td>
                <td>{{ o.rolling_reserve ? 'Да' : 'Нет' }}</td>
                <td>{{ o.insurance ? 'Да' : 'Нет' }}</td>
                <td>{{ o.date || '' }}</td>
                <td>
                  <button class="btn btn-danger" @click="del(o)">Удалить</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="error" class="small" style="color:#ff7a7a;margin-top:8px">
          {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>
