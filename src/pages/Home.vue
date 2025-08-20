<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from '../supabase'
import { VERTICALS, PROVIDER_TYPES, labelForProvider } from '../utils'

const loading = ref(false)
const rows = ref([])
const error = ref('')

const filters = ref({
  vertical: '',
  provider_type: '',
  rolling_reserve: '', // '', 'yes', 'no'
  insurance: '',       // '', 'yes', 'no'
  stakeMin: '',
  chekiMin: ''
})

async function load(){
  loading.value = true
  error.value = ''
  try{
    const { data, error:err } = await supabase
      .from('offers')
      .select('*')
      .order('date', { ascending: false })
    if(err) throw err
    rows.value = data || []
  }catch(e){
    error.value = e?.message || String(e)
    console.error(e)
  }finally{
    loading.value = false
  }
}

function pass(o){
  const f = filters.value

  if(f.vertical && o.vertical !== f.vertical) return false

  if(f.provider_type && o.provider_type !== f.provider_type) return false

  if(f.rolling_reserve==='yes' && !o.rolling_reserve) return false
  if(f.rolling_reserve==='no' && !!o.rolling_reserve) return false

  if(f.insurance==='yes' && !o.insurance) return false
  if(f.insurance==='no' && !!o.insurance) return false

  if(f.stakeMin!=='' && f.stakeMin!=null){
    const s = Number(o.stake ?? 0)
    if(!(s>=Number(f.stakeMin))) return false
  }
  if(f.chekiMin!=='' && f.chekiMin!=null){
    const c = Number(o.cheki ?? 0)
    if(!(c>=Number(f.chekiMin))) return false
  }
  return true
}
onMounted(load)
</script>

<template>
  <div class="grid grid-cols-2">
    <div class="card">
      <h2 style="margin-top:0">Поиск офферов</h2>
      <div class="grid" style="grid-template-columns:1fr 1fr; gap:12px">
        <div>
          <label class="small">Вертикаль</label>
          <select v-model="filters.vertical" class="select">
            <option value="">Любая</option>
            <option v-for="v in VERTICALS" :key="v" :value="v">{{ v }}</option>
          </select>
        </div>
        <div>
          <label class="small">Тип поставщика</label>
          <select v-model="filters.provider_type" class="select">
            <option value="">Любой</option>
            <option v-for="p in PROVIDER_TYPES" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
        </div>
        <div>
          <label class="small">Роллинг резерв</label>
          <select v-model="filters.rolling_reserve" class="select">
            <option value="">Любой</option>
            <option value="yes">Да</option>
            <option value="no">Нет</option>
          </select>
        </div>
        <div>
          <label class="small">Страховой</label>
          <select v-model="filters.insurance" class="select">
            <option value="">Любой</option>
            <option value="yes">Да</option>
            <option value="no">Нет</option>
          </select>
        </div>
        <div>
          <label class="small">Ставка, % (мин.)</label>
          <input v-model.number="filters.stakeMin" type="number" step="0.01" class="input" placeholder="например, 3" />
        </div>
        <div>
          <label class="small">Чеки от</label>
          <input v-model.number="filters.chekiMin" type="number" step="0.01" class="input" placeholder="например, 1000" />
        </div>
      </div>
      <div style="margin-top:12px; display:flex; gap:10px">
        <button class="btn" @click="load" :disabled="loading">Обновить</button>
        <button class="btn" @click="filters={vertical:'',provider_type:'',rolling_reserve:'',insurance:'',stakeMin:'',chekiMin:''}">Сброс</button>
      </div>
      <p v-if="error" class="small" style="color:#ff7a7a;margin-top:10px">{{ error }}</p>
    </div>

    <div class="card">
      <h2 style="margin-top:0">Результаты</h2>
      <p v-if="loading">Загрузка…</p>
      <p v-else-if="rows.filter(pass).length===0" class="small">Ничего не найдено. Измени фильтры или добавь офферы в админке.</p>
      <div v-else style="overflow:auto">
        <table class="table">
          <thead>
            <tr>
              <th>ID внутр.</th>
              <th>Вертикаль</th>
              <th>Тип</th>
              <th>Ставка %</th>
              <th>Чеки</th>
              <th>Ролл.резерв</th>
              <th>Страховой</th>
              <th>Settlement</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in rows.filter(pass)" :key="o.id">
              <td>{{ o.internal_id }}</td>
              <td>{{ o.vertical }}</td>
              <td><span class="badge">{{ labelForProvider(o.provider_type) }}</span></td>
              <td>{{ o.stake }}</td>
              <td>{{ o.cheki }}</td>
              <td>{{ o.rolling_reserve ? 'Да':'Нет' }}</td>
              <td>{{ o.insurance ? 'Да':'Нет' }}</td>
              <td>{{ o.settlement || '' }}</td>
              <td>{{ o.date || '' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
