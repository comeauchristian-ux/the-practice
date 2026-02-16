import React from 'react'

// ===========================
// 1) PROGRAM (edit here)
// ===========================
const PROGRAM = {
  A: {
    name: 'Day A',
    exercises: [
      { id:'ohp', name:'Standing Shoulder Press', hint:'Barbell', type:'strength', defaultWeight: 95, defaultReps: 6, weightStep: 5, repsStep: 1 },
      { id:'pullups', name:'Pull-Ups', hint:'', type:'strength', defaultWeight: 0, defaultReps: 12, weightStep: 5, repsStep: 1 },
      { id:'rdl', name:'Romanian Deadlift', hint:'', type:'strength', defaultWeight: 185, defaultReps: 8, weightStep: 5, repsStep: 1 },
      { id:'legext', name:'Leg Extensions', hint:'', type:'strength', defaultWeight: 90, defaultReps: 12, weightStep: 5, repsStep: 1 },
      { id:'tbar', name:'Chest-Supported T-Bar Row', hint:'Wide grip', type:'strength', defaultWeight: 70, defaultReps: 12, weightStep: 5, repsStep: 1 },
      { id:'inclinedb', name:'Incline DB Bench Press', hint:'', type:'strength', defaultWeight: 50, defaultReps: 11, weightStep: 5, repsStep: 1 },
      { id:'preacher', name:'Preacher Curls', hint:'', type:'strength', defaultWeight: 27.5, defaultReps: 12, weightStep: 2.5, repsStep: 1 },
      { id:'skull', name:'Cable Overhead Extensions', hint:'', type:'strength', defaultWeight: 52.5, defaultReps: 10, weightStep: 2.5, repsStep: 1 },
      { id:'latraise', name:'Lean-Away Lateral Raises', hint:'', type:'strength', defaultWeight: 10, defaultReps: 8, weightStep: 2.5, repsStep: 1 },
      { id:'calves', name:'Standing Calf Raises', hint:'', type:'strength', defaultWeight: 600, defaultReps: 12, weightStep: 5, repsStep: 1 },
      { id:'legraises', name:'Leg Raises', hint:'', type:'strength', defaultWeight: 0, defaultReps: 11, weightStep: 5, repsStep: 1 },
      { id:'walk', name:'Incline Walking', hint:'15 min', type:'cardio', defaultIncline: 5.0, defaultSpeed: 5.4, inclineStep: 0.5, speedStep: 0.1 },
    ],
  },
  B: {
    name: 'Day B',
    exercises: [
      { id:'chinups', name:'Chin-Ups', hint:'', type:'strength', defaultWeight: 25, defaultReps: 9, weightStep: 5, repsStep: 1 },
      { id:'ohp', name:'Standing Shoulder Press', hint:'Barbell', type:'strength', defaultWeight: 95, defaultReps: 6, weightStep: 5, repsStep: 1 },
      { id:'squat', name:'Squats', hint:'', type:'strength', defaultWeight: 185, defaultReps: 8, weightStep: 5, repsStep: 1 },
      { id:'legcurl', name:'Seated Leg Curls', hint:'', type:'strength', defaultWeight: 90, defaultReps: 12, weightStep: 5, repsStep: 1 },
      { id:'tbar', name:'Chest-Supported T-Bar Row', hint:'Wide grip', type:'strength', defaultWeight: 70, defaultReps: 12, weightStep: 5, repsStep: 1 },
      { id:'dips', name:'Chest Dips', hint:'', type:'strength', defaultWeight: 0, defaultReps: 12, weightStep: 5, repsStep: 1 },
      { id:'pullovers', name:'Pullovers', hint:'Dumbbells', type:'strength', defaultWeight: 0, defaultReps: 12, weightStep: 5, repsStep: 1 },
      { id:'pecdeck', name:'Pec Deck Fly', hint:'', type:'strength', defaultWeight: 120, defaultReps: 12, weightStep: 5, repsStep: 1 },
      { id:'revpec', name:'Reverse Pec Deck', hint:'', type:'strength', defaultWeight: 90, defaultReps: 12, weightStep: 5, repsStep: 1 },
      { id:'calves', name:'Standing Calf Raises', hint:'', type:'strength', defaultWeight: 600, defaultReps: 12, weightStep: 5, repsStep: 1 },
      { id:'legraises', name:'Leg Raises', hint:'', type:'strength', defaultWeight: 0, defaultReps: 11, weightStep: 5, repsStep: 1 },
      { id:'walk', name:'Incline Walking', hint:'15 min', type:'cardio', defaultIncline: 5.0, defaultSpeed: 5.4, inclineStep: 0.5, speedStep: 0.1 },
    ],
  },
}

// ===========================
// 2) STORAGE (local-first)
// ===========================
const STORAGE_KEY = 'gym_practice_vite_v3'
const LEGACY_STORAGE_KEY = 'gym_practice_vite_v2'

function deepClone(obj){
  return obj ? JSON.parse(JSON.stringify(obj)) : obj
}

function clamp(n, min, max){
  return Math.min(max, Math.max(min, n))
}

function normalizeCount(value){
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
}

function normalizeState(raw){
  return raw === 'inevitable' || raw === 'contested' ? raw : undefined
}

function normalizeSessionRecord(raw){
  if(!raw || typeof raw !== 'object'){
    return {}
  }
  const next = {}
  if(typeof raw.weight === 'number') next.weight = raw.weight
  if(typeof raw.reps === 'number') next.reps = raw.reps
  if(typeof raw.incline === 'number') next.incline = raw.incline
  if(typeof raw.speed === 'number') next.speed = raw.speed
  if(typeof raw.note === 'string' && raw.note.trim()) next.note = raw.note.trim()
  const state = normalizeState(raw.state)
  if(state) next.state = state
  return next
}

function normalizeLastN(raw){
  return extractStateSequence(raw).slice(-12)
}

function extractStateSequence(raw){
  const source = Array.isArray(raw?.lastN)
    ? raw.lastN
    : Array.isArray(raw?.history)
      ? raw.history
      : []
  return source.filter((s) => s === 'inevitable' || s === 'contested')
}

function mergeDayStateSequences(rawA, rawB){
  const seqA = extractStateSequence(rawA)
  const seqB = extractStateSequence(rawB)
  const mergedFromNewest = []
  let i = seqA.length - 1
  let j = seqB.length - 1
  // If one day has more entries, assume its tail is more likely to contain the latest log.
  let takeA = seqA.length > seqB.length

  while(i >= 0 || j >= 0){
    if(takeA && i >= 0){
      mergedFromNewest.push(seqA[i--])
      takeA = false
      continue
    }
    if(!takeA && j >= 0){
      mergedFromNewest.push(seqB[j--])
      takeA = true
      continue
    }
    if(i >= 0){
      mergedFromNewest.push(seqA[i--])
    }else if(j >= 0){
      mergedFromNewest.push(seqB[j--])
    }
  }

  return mergedFromNewest.reverse().slice(-12)
}

function normalizeLiftRecord(raw){
  const lastN = normalizeLastN(raw)
  const lastState = normalizeState(raw?.lastState) || lastN[lastN.length - 1]
  return {
    inevitableCount: normalizeCount(raw?.inevitableCount),
    contestedCount: normalizeCount(raw?.contestedCount),
    lastN,
    ...(lastState ? { lastState } : {}),
  }
}

function normalizeExerciseView(raw){
  return {
    ...normalizeLiftRecord(raw),
    ...normalizeSessionRecord(raw),
  }
}

function migrateLegacyState(parsed){
  const next = {
    dayKey: parsed?.dayKey === 'B' ? 'B' : 'A',
    plan: { ...(parsed?.plan || {}) },
    sessions: { A: {}, B: {} },
    lifts: {},
  }

  delete next.plan.backext

  const logs = parsed?.logs || {}
  const dates = Object.keys(logs).sort()

  for(const date of dates){
    for(const dayKey of ['A', 'B']){
      const dayLog = logs?.[date]?.[dayKey]
      if(!dayLog || typeof dayLog !== 'object') continue

      for(const exId of Object.keys(dayLog)){
        if(exId === 'backext') continue
        const source = dayLog[exId]
        if(!source || typeof source !== 'object') continue

        const current = normalizeSessionRecord(next.sessions[dayKey][exId])
        const merged = { ...current }

        if(typeof source.weight === 'number') merged.weight = source.weight
        if(typeof source.reps === 'number') merged.reps = source.reps
        if(typeof source.incline === 'number') merged.incline = source.incline
        if(typeof source.speed === 'number') merged.speed = source.speed
        if(typeof source.note === 'string' && source.note.trim()) merged.note = source.note.trim()

        const state = normalizeState(source.state)
        if(state){
          if(!next.lifts[exId]){
            next.lifts[exId] = {
              inevitableCount: 0,
              contestedCount: 0,
              lastN: [],
            }
          }
          if(state === 'inevitable') next.lifts[exId].inevitableCount += 1
          if(state === 'contested') next.lifts[exId].contestedCount += 1
          next.lifts[exId].lastN = [...next.lifts[exId].lastN, state].slice(-12)
          next.lifts[exId].lastState = state
        }

        next.sessions[dayKey][exId] = merged
      }
    }
  }

  return next
}

function normalizeLoadedState(parsed){
  const base = {
    dayKey: parsed?.dayKey === 'B' ? 'B' : 'A',
    plan: { ...(parsed?.plan || {}) },
    sessions: { A: {}, B: {} },
    lifts: {},
  }

  delete base.plan.backext

  for(const dayKey of ['A', 'B']){
    const session = parsed?.sessions?.[dayKey] || {}
    for(const exId of Object.keys(session)){
      if(exId === 'backext') continue
      base.sessions[dayKey][exId] = normalizeSessionRecord(session[exId])
    }
  }

  if(parsed?.lifts && typeof parsed.lifts === 'object'){
    for(const exId of Object.keys(parsed.lifts)){
      if(exId === 'backext') continue
      base.lifts[exId] = normalizeLiftRecord(parsed.lifts[exId])
    }
  }else{
    const sessionA = parsed?.sessions?.A || {}
    const sessionB = parsed?.sessions?.B || {}
    const exIds = new Set([...Object.keys(sessionA), ...Object.keys(sessionB)])
    for(const exId of exIds){
      if(exId === 'backext') continue
      const recA = sessionA[exId]
      const recB = sessionB[exId]
      const merged = {
        inevitableCount: normalizeCount(recA?.inevitableCount) + normalizeCount(recB?.inevitableCount),
        contestedCount: normalizeCount(recA?.contestedCount) + normalizeCount(recB?.contestedCount),
        lastN: mergeDayStateSequences(recA, recB),
      }
      const lastState = normalizeState(recA?.lastState) || normalizeState(recB?.lastState) || merged.lastN[merged.lastN.length - 1]
      if(lastState) merged.lastState = lastState
      base.lifts[exId] = merged
    }
  }

  return base
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    if(raw){
      const parsed = JSON.parse(raw)
      const normalized = normalizeLoadedState(parsed)
      saveState(normalized)
      return normalized
    }

    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if(legacyRaw){
      const parsedLegacy = JSON.parse(legacyRaw)
      const migrated = migrateLegacyState(parsedLegacy)
      saveState(migrated)
      return migrated
    }

    return { dayKey: 'A', plan: {}, sessions: { A: {}, B: {} }, lifts: {} }
  }catch(e){
    return { dayKey: 'A', plan: {}, sessions: { A: {}, B: {} }, lifts: {} }
  }
}

function saveState(state){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

// ===========================
// 3) Components
// ===========================
function Button({variant, onClick, children, title}){
  const cls = ['btn']
  if(variant) cls.push(variant)
  return <button className={cls.join(' ')} onClick={onClick} title={title}>{children}</button>
}
function StatChip({children, title}){
  return <span className="chip" title={title}>{children}</span>
}

const SEGMENT_MAP = {
  '0': ['a','b','c','d','e','f'],
  '1': ['b','c'],
  '2': ['a','b','d','e','g'],
  '3': ['a','b','c','d','g'],
  '4': ['b','c','f','g'],
  '5': ['a','c','d','f','g'],
  '6': ['a','c','d','e','f','g'],
  '7': ['a','b','c'],
  '8': ['a','b','c','d','e','f','g'],
  '9': ['a','b','c','d','f','g'],
}

const REP_RANGE_BY_ID = {
  ohp: '5-7',
  squat: '5-7',
  pullups: '6-8',
  chinups: '6-8',
  inclinedb: '6-8',
  rdl: '6-8',
  tbar: '8-10',
  dips: '6-10',
  legcurl: '10-15',
  legext: '10-15',
  pecdeck: '10-15',
  revpec: '10-15',
  calves: '8-12',
  skull: '8-12',
  preacher: '8-12',
  latraise: '12-20',
  pullovers: '8-15',
  legraises: '8-15',
}

function getRepLabel(exercise){
  const range = REP_RANGE_BY_ID[exercise?.id]
  return range ? `Reps (${range})` : 'Reps'
}

function formatSegmentNumber(value){
  if(typeof value !== 'number' || Number.isNaN(value)) return '0'
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : String(rounded).replace(/\.0$/, '')
}

function SegmentGlyph({char}){
  if(char === '.'){
    return <span className="segDot" />
  }
  if(char === '-'){
    return (
      <span className="segDigit">
        <span className="seg seg-g on" />
      </span>
    )
  }

  const lit = SEGMENT_MAP[char] || []
  return (
    <span className="segDigit">
      <span className={'seg seg-a' + (lit.includes('a') ? ' on' : '')} />
      <span className={'seg seg-b' + (lit.includes('b') ? ' on' : '')} />
      <span className={'seg seg-c' + (lit.includes('c') ? ' on' : '')} />
      <span className={'seg seg-d' + (lit.includes('d') ? ' on' : '')} />
      <span className={'seg seg-e' + (lit.includes('e') ? ' on' : '')} />
      <span className={'seg seg-f' + (lit.includes('f') ? ' on' : '')} />
      <span className={'seg seg-g' + (lit.includes('g') ? ' on' : '')} />
    </span>
  )
}

function SegmentDisplay({value}){
  const text = formatSegmentNumber(value)
  return (
    <div className="segmentDisplay" aria-label={text}>
      {text.split('').map((char, idx) => (
        <SegmentGlyph char={char} key={idx} />
      ))}
    </div>
  )
}

function formatTarget(ex, entry, plan){
  if(ex.type === 'cardio'){
    const inc = entry?.incline ?? plan?.defaultIncline ?? ex.defaultIncline ?? 0
    const spd = entry?.speed ?? plan?.defaultSpeed ?? ex.defaultSpeed ?? 0
    return {
      primary: `${inc}%`,
      secondary: `${spd} kph`,
      left: { label: 'Incline', value: inc, unit: '%' },
      right: { label: 'Speed', value: spd, unit: 'kph' },
    }
  }
  const w = entry?.weight ?? plan?.defaultWeight ?? ex.defaultWeight ?? 0
  const r = entry?.reps ?? plan?.defaultReps ?? ex.defaultReps ?? 0
  return {
    primary: `${w} lb`,
    secondary: `${r} reps`,
    left: { label: 'Weight', value: w, unit: 'lb' },
    right: { label: getRepLabel(ex), value: r, unit: 'reps' },
  }
}

function formatStateLabel(state){
  if(state === 'inevitable') return 'Inevitable'
  if(state === 'contested') return 'Contested'
  return ''
}

function buildFrequencyLines(performanceHistory){
  const map = new Map()
  for(const signature of performanceHistory || []){
    if(!signature) continue
    map.set(signature, (map.get(signature) || 0) + 1)
  }
  return Array.from(map.entries())
    .map(([signature, count]) => ({ signature, count }))
    .sort((a, b) => b.count - a.count || a.signature.localeCompare(b.signature))
    .slice(0, 3)
    .map((item) => `${item.signature}  n=${item.count}`)
}

function ExerciseTile({
  exercise,
  entry,
  planEntry,
  onSetState,
  onAdjust,
  onOpenDetails,
  onOpenNote,
  onClearState,
}){
  const target = formatTarget(exercise, entry, planEntry)
  const stableEntry = normalizeExerciseView(entry)

  const tileCls = [
    'tile',
    stableEntry?.state === 'inevitable' ? 'tileOk' : '',
    stableEntry?.state === 'contested' ? 'tileWarn' : '',
  ].filter(Boolean).join(' ')

  const recentBlocks = stableEntry.lastN
  const frequencyLines = buildFrequencyLines(stableEntry.performanceHistory)

  return (
    <div className={tileCls}>
      <div className="tileTop">
        <button className="tileTitleBtn" onClick={() => onOpenDetails(exercise.id)} title="Open exercise details">
          <div className="tileName">{exercise.name}</div>
          {exercise.hint ? <div className="tileMeta">{exercise.hint}</div> : null}
        </button>
        <Button variant="ghost topNoteBtn" onClick={() => onOpenNote(exercise.id)}>✎ Note</Button>
      </div>

      <div className="controlPanel">
        <div className="leftStack">
          <div className="targetRow">
            <div className="targetsGroup">
              <div className="target">
                <div className="targetLabel">{target.left.label}</div>
                <SegmentDisplay value={target.left.value} />
                <div className="targetSmall">{target.left.unit}</div>
              </div>
              <div className="target">
                <div className="targetLabel">{target.right.label}</div>
                <SegmentDisplay value={target.right.value} />
                <div className="targetSmall">{target.right.unit}</div>
              </div>
            </div>
          </div>

          <div className="btnRow">
            <Button variant={stableEntry?.state === 'inevitable' ? 'ok active' : 'ok'} onClick={() => onSetState(exercise.id, 'inevitable')}>✓ Inevitable</Button>
            <Button variant={stableEntry?.state === 'contested' ? 'warn active' : 'warn'} onClick={() => onSetState(exercise.id, 'contested')}>△ Contested</Button>
            <Button variant="ghost clearIconBtn" onClick={() => onClearState(exercise.id)} title="Clear exercise state">↺</Button>
          </div>
        </div>

        <div className="steppers">
          {exercise.type === 'cardio' ? (
            <>
              <div className="stepGroup">
                <div className="stepLabel">Incline</div>
                <div className="stepBtns">
                  <button className="stepBtn" aria-label="Decrease incline" title="Decrease incline" onClick={() => onAdjust(exercise.id, 'incline', -exercise.inclineStep)} />
                  <button className="stepBtn" aria-label="Increase incline" title="Increase incline" onClick={() => onAdjust(exercise.id, 'incline', +exercise.inclineStep)} />
                </div>
              </div>
              <div className="stepGroup">
                <div className="stepLabel">Speed</div>
                <div className="stepBtns">
                  <button className="stepBtn" aria-label="Decrease speed" title="Decrease speed" onClick={() => onAdjust(exercise.id, 'speed', -exercise.speedStep)} />
                  <button className="stepBtn" aria-label="Increase speed" title="Increase speed" onClick={() => onAdjust(exercise.id, 'speed', +exercise.speedStep)} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="stepGroup">
                <div className="stepLabel">Weight</div>
                <div className="stepBtns">
                  <button className="stepBtn" aria-label="Decrease weight" title="Decrease weight" onClick={() => onAdjust(exercise.id, 'weight', -exercise.weightStep)} />
                  <button className="stepBtn" aria-label="Increase weight" title="Increase weight" onClick={() => onAdjust(exercise.id, 'weight', +exercise.weightStep)} />
                </div>
              </div>
              <div className="stepGroup">
                <div className="stepLabel">{getRepLabel(exercise)}</div>
                <div className="stepBtns">
                  <button className="stepBtn" aria-label="Decrease reps" title="Decrease reps" onClick={() => onAdjust(exercise.id, 'reps', -exercise.repsStep)} />
                  <button className="stepBtn" aria-label="Increase reps" title="Increase reps" onClick={() => onAdjust(exercise.id, 'reps', +exercise.repsStep)} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="historyMini">
        <div className="stabilityBars" aria-label="Last 12 logged states">
          {recentBlocks.length ? recentBlocks.map((state, idx) => (
            <span key={idx} className={'stabilityBlock ' + state} />
          )) : <span className="stabilityEmpty">No sealed logs yet.</span>}
        </div>
        {frequencyLines.length ? (
          <div className="liftHistoryList">
            {frequencyLines.map((line, idx) => (
              <div className="liftHistoryLine" key={idx}>{line}</div>
            ))}
          </div>
        ) : null}
      </div>

      {stableEntry?.note ? (
        <div className="note">
          <div className="noteLabel">Note</div>
          {stableEntry.note}
        </div>
      ) : null}
    </div>
  )
}

function Modal({title, children, onClose}){
  React.useEffect(() => {
    function onKey(e){ if(e.key==='Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modalOverlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e)=>e.stopPropagation()}>
        <div className="modalHeader">
          <h3>{title}</h3>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  )
}

// ===========================
// 4) Helpers
// ===========================
function ensurePlan(state){
  if(!state.plan) state.plan = {}
  return state
}

function ensureSession(state, dayKey){
  if(!state.sessions) state.sessions = { A: {}, B: {} }
  if(!state.sessions[dayKey]) state.sessions[dayKey] = {}
  return state
}

function ensureLift(state, exId){
  if(!state.lifts) state.lifts = {}
  if(!state.lifts[exId]){
    state.lifts[exId] = {
      inevitableCount: 0,
      contestedCount: 0,
      lastN: [],
    }
  }
  state.lifts[exId] = normalizeLiftRecord(state.lifts[exId])
  return state
}

function ensureExerciseSession(state, dayKey, exId){
  ensureSession(state, dayKey)
  if(!state.sessions[dayKey][exId]){
    state.sessions[dayKey][exId] = {}
  }
  state.sessions[dayKey][exId] = normalizeSessionRecord(state.sessions[dayKey][exId])
  return state
}

function exerciseByIdAndDay(dayKey, exId){
  return PROGRAM[dayKey]?.exercises?.find((e) => e.id === exId) || null
}

// ===========================
// 5) App
// ===========================
export default function App(){
  const [appState, setAppState] = React.useState(loadState())
  const [noteFor, setNoteFor] = React.useState(null)
  const [noteDraft, setNoteDraft] = React.useState('')
  const [detailsFor, setDetailsFor] = React.useState(null)
  const [showStateHelp, setShowStateHelp] = React.useState(false)
  const [showSettings, setShowSettings] = React.useState(false)

  const activeDayKey = appState.dayKey === 'B' ? 'B' : 'A'
  const day = PROGRAM[activeDayKey]
  const currentSession = appState.sessions?.[activeDayKey] || {}
  const sharedLifts = appState.lifts || {}

  function persist(next){
    setAppState(next)
    saveState(next)
  }

  function setDay(dayKey){
    const next = deepClone(appState)
    next.dayKey = dayKey === 'B' ? 'B' : 'A'
    persist(next)
  }

  function updateExercise(exId, patch){
    const next = ensureExerciseSession(deepClone(appState), activeDayKey, exId)
    const prev = normalizeSessionRecord(next.sessions[activeDayKey][exId])
    next.sessions[activeDayKey][exId] = { ...prev, ...patch, state: normalizeState(patch.state ?? prev.state) }
    persist(next)
  }

  function clearExerciseState(exId){
    const next = ensureExerciseSession(deepClone(appState), activeDayKey, exId)
    const prev = normalizeSessionRecord(next.sessions[activeDayKey][exId])
    if(!prev.state) return
    const { state, ...rest } = prev
    next.sessions[activeDayKey][exId] = rest
    persist(next)
  }

  function sealTrainingSession(){
    const next = ensureSession(deepClone(appState), activeDayKey)

    for(const ex of day.exercises){
      ensureExerciseSession(next, activeDayKey, ex.id)
      ensureLift(next, ex.id)
      const record = normalizeSessionRecord(next.sessions[activeDayKey][ex.id])
      const lift = normalizeLiftRecord(next.lifts[ex.id])

      if(record.state === 'inevitable'){
        lift.inevitableCount += 1
        lift.lastN = [...lift.lastN, 'inevitable'].slice(-12)
        lift.lastState = 'inevitable'
      }else if(record.state === 'contested'){
        lift.contestedCount += 1
        lift.lastN = [...lift.lastN, 'contested'].slice(-12)
        lift.lastState = 'contested'
      }

      // Explicitly clear current session markers after sealing.
      delete record.state
      delete record.note
      next.sessions[activeDayKey][ex.id] = record
      next.lifts[ex.id] = lift
    }

    persist(next)
  }

  function openNote(exId){
    setNoteFor(exId)
    setNoteDraft((currentSession?.[exId]?.note) || '')
  }

  function saveNote(){
    if(!noteFor) return
    updateExercise(noteFor, { note: noteDraft.trim() })
    setNoteFor(null)
    setNoteDraft('')
  }

  function openDetails(exId){
    setDetailsFor(exId)
  }

  function adjust(exId, field, delta){
    const ex = exerciseByIdAndDay(activeDayKey, exId)
    if(!ex) return

    const entry = normalizeSessionRecord(currentSession[exId])
    const plan = appState.plan?.[exId] || {}

    if(ex.type === 'cardio'){
      const currentIncline = entry.incline ?? plan.defaultIncline ?? ex.defaultIncline ?? 0
      const currentSpeed = entry.speed ?? plan.defaultSpeed ?? ex.defaultSpeed ?? 0
      if(field === 'incline'){
        const v = Math.round((currentIncline + delta) * 10) / 10
        updateExercise(exId, { incline: clamp(v, 0, 30) })
      }else if(field === 'speed'){
        const v = Math.round((currentSpeed + delta) * 10) / 10
        updateExercise(exId, { speed: clamp(v, 0, 30) })
      }
      return
    }

    const currentW = entry.weight ?? plan.defaultWeight ?? ex.defaultWeight ?? 0
    const currentR = entry.reps ?? plan.defaultReps ?? ex.defaultReps ?? 0
    if(field === 'weight'){
      const v = Math.round((currentW + delta) * 10) / 10
      updateExercise(exId, { weight: clamp(v, 0, 2000) })
    }else if(field === 'reps'){
      const v = Math.round((currentR + delta) * 10) / 10
      updateExercise(exId, { reps: clamp(v, 0, 100) })
    }
  }

  function setAsDefault(exId){
    const ex = exerciseByIdAndDay(activeDayKey, exId)
    if(!ex) return

    const entry = normalizeSessionRecord(currentSession[exId])
    const next = ensurePlan(deepClone(appState))
    if(!next.plan[exId]) next.plan[exId] = {}

    if(ex.type === 'cardio'){
      if(typeof entry.incline === 'number') next.plan[exId].defaultIncline = entry.incline
      if(typeof entry.speed === 'number') next.plan[exId].defaultSpeed = entry.speed
    }else{
      if(typeof entry.weight === 'number') next.plan[exId].defaultWeight = entry.weight
      if(typeof entry.reps === 'number') next.plan[exId].defaultReps = entry.reps
    }

    persist(next)
  }

  function clearAllData(){
    const next = deepClone(appState)
    next.sessions = { A: {}, B: {} }
    next.lifts = {}
    persist(next)
    setShowSettings(false)
  }

  return (
    <div className="wrap">
      <header>
        <div className="title">
          <h1>The Practice</h1>
          <div className="subtitle">One set. Stable targets. Quick tweaks. Honest history.</div>
        </div>
        <div className="topActions">
          <button className="btn ghost topSettingsBtn" onClick={() => setShowSettings(true)} title="Settings">Settings</button>
          <button className="btn ghost topHelpBtn" onClick={() => setShowStateHelp(true)} title="Inevitable vs Contested help">?</button>
        </div>
      </header>

      <div className="grid">
        <div className="card">
          <div className="cardHeader">
            <h2>{day.name}</h2>
            <div className="dayToggle" role="tablist" aria-label="Workout day selector">
              <button
                className={'dayToggleBtn' + (activeDayKey === 'A' ? ' active' : '')}
                onClick={() => setDay('A')}
                role="tab"
                aria-selected={activeDayKey === 'A'}
              >
                Day A
              </button>
              <button
                className={'dayToggleBtn' + (activeDayKey === 'B' ? ' active' : '')}
                onClick={() => setDay('B')}
                role="tab"
                aria-selected={activeDayKey === 'B'}
              >
                Day B
              </button>
            </div>
          </div>

          <div className="cardBody">
            <div className="list">
              {day.exercises.map(ex => (
                <ExerciseTile
                  key={ex.id}
                  exercise={ex}
                  entry={{ ...sharedLifts[ex.id], ...currentSession[ex.id] }}
                  planEntry={appState.plan?.[ex.id]}
                  onSetState={(id, state) => updateExercise(id, { state })}
                  onAdjust={adjust}
                  onOpenDetails={openDetails}
                  onOpenNote={openNote}
                  onClearState={clearExerciseState}
                />
              ))}
            </div>

            <div className="footerHint">
              Select a state per exercise, then press Log Training to seal this session.
            </div>
            <div className="logTrainingWrap">
              <button className="btn ok logTrainingBtn" onClick={sealTrainingSession}>Log Training</button>
            </div>
          </div>
        </div>
      </div>

      {noteFor ? (
        <Modal title="Add a note" onClose={() => setNoteFor(null)}>
          <div className="tiny" style={{marginBottom:8}}>
            One line is enough. (Example: “Contested early - slept badly.”)
          </div>
          <textarea value={noteDraft} onChange={(e)=>setNoteDraft(e.target.value)} placeholder="Write a short note..." />
          <div style={{display:'flex', gap:10, justifyContent:'flex-end', marginTop:10}}>
            <Button variant="ghost" onClick={() => setNoteFor(null)}>Cancel</Button>
            <Button variant="ok" onClick={saveNote}>Save</Button>
          </div>
        </Modal>
      ) : null}

      {detailsFor ? (
        (() => {
          const ex = exerciseByIdAndDay(activeDayKey, detailsFor)
          if(!ex) return null

          const entry = normalizeSessionRecord(currentSession[detailsFor])
          const lift = normalizeLiftRecord(sharedLifts[detailsFor])
          const plan = appState.plan?.[detailsFor]
          const tgt = formatTarget(ex, entry, plan)
          const lines = lift.lastN.map(formatStateLabel).reverse()

          return (
            <Modal title={ex.name} onClose={() => setDetailsFor(null)}>
              <div className="detailsGrid">
                <div className="detailsLeft">
                  <div className="detailsTarget">
                    <StatChip title="Current target">{tgt.primary} · {tgt.secondary}</StatChip>
                    <StatChip title="Promote today's values to defaults" >
                      <button className="linkBtn" onClick={() => setAsDefault(detailsFor)}>Set as default</button>
                    </StatChip>
                  </div>
                </div>

                <div className="detailsRight">
                  <div className="muscleTitle" style={{marginBottom:8}}>History</div>
                  {lines.length ? (
                    <div className="historyFull">
                      {lines.slice(0, 20).map((ln, idx) => (
                        <div className="historyLine" key={idx}>{ln}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="tiny">No history yet.</div>
                  )}
                </div>
              </div>
            </Modal>
          )
        })()
      ) : null}

      {showStateHelp ? (
        <Modal title="Inevitable vs Contested" onClose={() => setShowStateHelp(false)}>
          <div className="helpCopy">
            <div className="helpLine">This does not measure effort.</div>
            <div className="helpLine">It measures certainty.</div>
            <div className="helpSectionTitle">Inevitable</div>
            <div className="helpLine">At no point did failure feel possible.</div>
            <div className="helpLine">The rep may have been slow, but its completion was never in doubt.</div>
            <div className="helpSectionTitle">Contested</div>
            <div className="helpLine">There was a moment where failure felt possible.</div>
            <div className="helpLine">You had to stay with the movement to allow it to complete.</div>
            <div className="helpSectionTitle">If unsure, choose Contested.</div>
          </div>
        </Modal>
      ) : null}

      {showSettings ? (
        <Modal title="Settings" onClose={() => setShowSettings(false)}>
          <div className="settingsMenu">
            <button className="settingsItem danger" onClick={clearAllData}>
              Clear data
            </button>
            <div className="tiny">This removes all logged history for Day A and Day B.</div>
          </div>
        </Modal>
      ) : null}

    </div>
  )
}
