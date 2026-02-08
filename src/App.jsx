import React from 'react'
import { buildImportedLogs } from './importHistory'

// ===========================
// 1) PROGRAM (edit here)
// ===========================
// You said: one set only. So each exercise has a single target.
// - type: "strength" uses weight + reps
// - type: "cardio" uses incline + speed (kph)
const PROGRAM = {
  A: {
    name: 'Day A',
    exercises: [
      { id:'ohp', name:'Standing Shoulder Press', hint:'Barbell', type:'strength', defaultWeight: 95, defaultReps: 6, weightStep: 5, repsStep: 1 },
      { id:'pullups', name:'Pull-Ups', hint:'Wide overhand', type:'strength', defaultWeight: 0, defaultReps: 12, weightStep: 5, repsStep: 1 },
      { id:'rdl', name:'Romanian Deadlift', hint:'', type:'strength', defaultWeight: 185, defaultReps: 8, weightStep: 5, repsStep: 1 },
      { id:'legext', name:'Leg Extensions', hint:'', type:'strength', defaultWeight: 90, defaultReps: 12, weightStep: 5, repsStep: 1 },
      { id:'tbar', name:'Chest-Supported T-Bar Row', hint:'Wide grip', type:'strength', defaultWeight: 70, defaultReps: 12, weightStep: 5, repsStep: 1 },
      { id:'inclinedb', name:'Incline DB Bench Press', hint:'', type:'strength', defaultWeight: 50, defaultReps: 11, weightStep: 5, repsStep: 1 },
      { id:'preacher', name:'Preacher Curls', hint:'', type:'strength', defaultWeight: 27.5, defaultReps: 12, weightStep: 2.5, repsStep: 1 },
      { id:'skull', name:'Cable Overhead Extensions', hint:'', type:'strength', defaultWeight: 52.5, defaultReps: 10, weightStep: 2.5, repsStep: 1 },
      { id:'latraise', name:'Lean-Away Lateral Raises', hint:'', type:'strength', defaultWeight: 10, defaultReps: 8, weightStep: 2.5, repsStep: 1 },
      { id:'calves', name:'Standing Calf Raises', hint:'', type:'strength', defaultWeight: 600, defaultReps: 12, weightStep: 5, repsStep: 1 },
      { id:'legraises', name:'Leg Raises', hint:'(see note)', type:'strength', defaultWeight: 0, defaultReps: 11, weightStep: 5, repsStep: 1 },
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
      { id:'dips', name:'Chest Dips', hint:'Deep', type:'strength', defaultWeight: 0, defaultReps: 12, weightStep: 5, repsStep: 1 },
      { id:'backext', name:'Back Extensions', hint:'Roman chair', type:'strength', defaultWeight: 0, defaultReps: 12, weightStep: 5, repsStep: 1 },
      { id:'pecdeck', name:'Pec Deck Fly', hint:'Wide', type:'strength', defaultWeight: 120, defaultReps: 12, weightStep: 5, repsStep: 1 },
      { id:'revpec', name:'Reverse Pec Deck', hint:'Wide', type:'strength', defaultWeight: 90, defaultReps: 12, weightStep: 5, repsStep: 1 },
      { id:'calves', name:'Standing Calf Raises', hint:'', type:'strength', defaultWeight: 600, defaultReps: 12, weightStep: 5, repsStep: 1 },
      { id:'legraises', name:'Leg Raises', hint:'(see note)', type:'strength', defaultWeight: 0, defaultReps: 11, weightStep: 5, repsStep: 1 },
      { id:'walk', name:'Incline Walking', hint:'15 min', type:'cardio', defaultIncline: 5.0, defaultSpeed: 5.4, inclineStep: 0.5, speedStep: 0.1 },
    ],
  },
}

// ===========================
// 2) STORAGE (local-first)
// ===========================
const STORAGE_KEY = 'gym_practice_vite_v2'
const IMPORTED_LOGS = buildImportedLogs()

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    if(!raw) return { view:'today', dayKey:'A', plan:{}, logs:deepClone(IMPORTED_LOGS) }
    const parsed = JSON.parse(raw)
    const mergedLogs = mergeLogsWithImported(parsed.logs || {})
    return { view:'today', dayKey:'A', plan:{}, ...parsed, logs:mergedLogs }
  }catch(e){
    return { view:'today', dayKey:'A', plan:{}, logs:deepClone(IMPORTED_LOGS) }
  }
}
function mergeLogsWithImported(logs){
  const merged = deepClone(IMPORTED_LOGS) || {}
  for(const date of Object.keys(logs || {})){
    if(!merged[date]) merged[date] = {}
    for(const dayKey of Object.keys(logs[date] || {})){
      merged[date][dayKey] = { ...(merged[date][dayKey] || {}), ...(logs[date][dayKey] || {}) }
    }
  }
  return merged
}
function saveState(state){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
function todayISO(){
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  const day = String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${day}`
}
function addDaysISO(dateISO, deltaDays){
  const [y, m, d] = dateISO.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + deltaDays)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth()+1).padStart(2,'0')
  const dd = String(dt.getDate()).padStart(2,'0')
  return `${yy}-${mm}-${dd}`
}
function oppositeDayKey(dayKey){
  return dayKey === 'A' ? 'B' : 'A'
}
function pickDominantDayKeyForDate(logs, date){
  const dayA = logs?.[date]?.A || {}
  const dayB = logs?.[date]?.B || {}
  const aCount = Object.keys(dayA).length
  const bCount = Object.keys(dayB).length
  if(aCount && !bCount) return 'A'
  if(bCount && !aCount) return 'B'
  if(!aCount && !bCount) return null
  const aTs = Math.max(0, ...Object.values(dayA).map(e => e?.updatedAt || 0))
  const bTs = Math.max(0, ...Object.values(dayB).map(e => e?.updatedAt || 0))
  return aTs >= bTs ? 'A' : 'B'
}
function resolveWorkoutDayKey(logs, date){
  const onDate = pickDominantDayKeyForDate(logs, date)
  if(onDate) return onDate
  const dates = Object.keys(logs || {}).filter(d => d < date).sort().reverse()
  for(const d of dates){
    const prior = pickDominantDayKeyForDate(logs, d)
    if(prior) return oppositeDayKey(prior)
  }
  return 'A'
}
function prettyStateTag(v){
  if(v==='inevitable') return { label:'Inevitable', cls:'ok' }
  if(v==='contested') return { label:'Contested', cls:'warn' }
  if(v==='done') return { label:'Done', cls:'done' }
  return { label:'—', cls:'' }
}
function deepClone(obj){
  return obj ? JSON.parse(JSON.stringify(obj)) : obj
}
function clamp(n, min, max){
  return Math.min(max, Math.max(min, n))
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

function formatTarget(ex, entry, plan){
  if(ex.type === 'cardio'){
    const inc = entry?.incline ?? plan?.defaultIncline ?? ex.defaultIncline ?? 0
    const spd = entry?.speed ?? plan?.defaultSpeed ?? ex.defaultSpeed ?? 0
    return { primary: `${inc}%`, secondary: `${spd} kph`, inc, spd }
  }
  const w = entry?.weight ?? plan?.defaultWeight ?? ex.defaultWeight ?? 0
  const r = entry?.reps ?? plan?.defaultReps ?? ex.defaultReps ?? 0
  return { primary: `${w} lb`, secondary: `${r} reps`, w, r }
}

function ExerciseTile({
  exercise,
  entry,
  cueText,
  planEntry,
  historyLines,
  onSetState,
  onAdjust,
  onOpenDetails,
  onOpenNote,
  onClear,
  onOpenHelp,
}){
  const tag = prettyStateTag(entry?.state)
  const target = formatTarget(exercise, entry, planEntry)

  const tileCls = [
    'tile',
    entry?.state === 'inevitable' ? 'tileOk' : '',
    entry?.state === 'contested' ? 'tileWarn' : '',
    entry?.state === 'done' ? 'tileDone' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={tileCls}>
      <div className="tileTop">
        <button className="tileTitleBtn" onClick={() => onOpenDetails(exercise.id)} title="Open exercise details">
          <div className="tileName">{exercise.name}</div>
          {exercise.hint ? <div className="tileMeta">{exercise.hint}</div> : null}
          {cueText ? <div className="presenceCue">{cueText}</div> : null}
        </button>
        <div className={'stateTag ' + tag.cls}>{tag.label}</div>
      </div>

      <div className="targetRow">
        <div className="target">
          <div className="targetBig">{target.primary}</div>
          <div className="targetSmall">{target.secondary}</div>
        </div>

        <div className="steppers">
          {exercise.type === 'cardio' ? (
            <>
              <div className="stepGroup">
                <div className="stepLabel">Incline</div>
                <div className="stepBtns">
                  <button className="stepBtn" onClick={() => onAdjust(exercise.id, 'incline', -exercise.inclineStep)}>-</button>
                  <button className="stepBtn" onClick={() => onAdjust(exercise.id, 'incline', +exercise.inclineStep)}>+</button>
                </div>
              </div>
              <div className="stepGroup">
                <div className="stepLabel">Speed</div>
                <div className="stepBtns">
                  <button className="stepBtn" onClick={() => onAdjust(exercise.id, 'speed', -exercise.speedStep)}>-</button>
                  <button className="stepBtn" onClick={() => onAdjust(exercise.id, 'speed', +exercise.speedStep)}>+</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="stepGroup">
                <div className="stepLabel">Weight</div>
                <div className="stepBtns">
                  <button className="stepBtn" onClick={() => onAdjust(exercise.id, 'weight', -exercise.weightStep)}>-</button>
                  <button className="stepBtn" onClick={() => onAdjust(exercise.id, 'weight', +exercise.weightStep)}>+</button>
                </div>
              </div>
              <div className="stepGroup">
                <div className="stepLabel">Reps</div>
                <div className="stepBtns">
                  <button className="stepBtn" onClick={() => onAdjust(exercise.id, 'reps', -exercise.repsStep)}>-</button>
                  <button className="stepBtn" onClick={() => onAdjust(exercise.id, 'reps', +exercise.repsStep)}>+</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="btnRow">
        {exercise.id === 'walk' ? (
          <Button variant="done" onClick={() => onSetState(exercise.id, 'done')}>◉ Done</Button>
        ) : (
          <>
            <Button variant="ok" onClick={() => onSetState(exercise.id, 'inevitable')}>✓ Inevitable</Button>
            <Button variant="warn" onClick={() => onSetState(exercise.id, 'contested')}>△ Contested</Button>
          </>
        )}
        <Button variant="ghost" onClick={() => onOpenNote(exercise.id)}>✎ Note</Button>
        <Button variant="ghost" onClick={() => onClear(exercise.id)} title="Clear this day entry">↺ Clear</Button>
        <button className="btn ghost helpBtn" onClick={onOpenHelp} title="Inevitable vs Contested help">?</button>
      </div>

      {historyLines?.length ? (
        <div className="historyMini">
          {historyLines.slice(0,2).map((ln, idx) => (
            <div className="historyLine" key={idx}>{ln}</div>
          ))}
        </div>
      ) : (
        <div className="historyMini muted">No history yet.</div>
      )}

      {entry?.note ? (
        <div className="note">
          <div className="noteLabel">Note</div>
          {entry.note}
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
function ensureDayLog(state, date, dayKey){
  const logs = state.logs || {}
  if(!logs[date]) logs[date] = {}
  if(!logs[date][dayKey]) logs[date][dayKey] = {}
  state.logs = logs
  return state
}
function ensurePlan(state){
  if(!state.plan) state.plan = {}
  return state
}

function exerciseById(exId){
  for(const k of ['A','B']){
    const found = PROGRAM[k].exercises.find(e => e.id === exId)
    if(found) return found
  }
  return null
}

function buildExerciseCounts(logs, exId){
  // returns [{key, count}] sorted by count desc then lastSeen desc
  const map = new Map()
  const lastSeen = new Map()
  const dates = Object.keys(logs || {}).sort()
  for(const d of dates){
    for(const dayKey of ['A','B']){
      const dayLog = logs?.[d]?.[dayKey]
      const entry = dayLog?.[exId]
      if(!entry) continue

      const ex = exerciseById(exId)
      if(!ex) continue

      let key = ''
      if(ex.type === 'cardio'){
        const inc = entry.incline ?? ex.defaultIncline ?? 0
        const spd = entry.speed ?? ex.defaultSpeed ?? 0
        key = `${inc}% @ ${spd} kph`
      }else{
        const w = entry.weight ?? 0
        const r = entry.reps ?? 0
        key = `${w} lb × ${r}`
      }

      map.set(key, (map.get(key) || 0) + 1)
      lastSeen.set(key, d)
    }
  }

  const arr = Array.from(map.entries()).map(([key, count]) => ({
    key,
    count,
    lastSeen: lastSeen.get(key) || '0000-00-00',
  }))
  arr.sort((a,b) => (b.count - a.count) || (b.lastSeen.localeCompare(a.lastSeen)))
  return arr
}

function getLastCue(exerciseId, logs, todayDate){
  const dates = Object.keys(logs || {}).sort().reverse()
  for(const date of dates){
    if(date === todayDate) continue

    const candidates = []
    for(const dayKey of ['A','B']){
      const entry = logs?.[date]?.[dayKey]?.[exerciseId]
      if(entry?.state === 'inevitable' || entry?.state === 'contested'){
        candidates.push(entry)
      }
    }

    if(!candidates.length) continue
    candidates.sort((a,b) => (b.updatedAt || 0) - (a.updatedAt || 0))

    if(candidates[0].state === 'inevitable') return 'One more breath'
    if(candidates[0].state === 'contested') return 'This rep, fully'
  }
  return 'Let the movement show itself'
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
  const [dateOffset, setDateOffset] = React.useState(0)
  const today = todayISO()
  const date = addDaysISO(today, dateOffset)

  const activeDayKey = React.useMemo(() => resolveWorkoutDayKey(appState.logs, date), [appState.logs, date])
  const day = PROGRAM[activeDayKey]
  const todaysLog = (appState.logs && appState.logs[date] && appState.logs[date][activeDayKey]) || {}

  // Build per-exercise history summary lines (e.g., "185 lb × 8 — 13x")
  const historyByExId = React.useMemo(() => {
    const out = {}
    for(const k of ['A','B']){
      for(const ex of PROGRAM[k].exercises){
        const counts = buildExerciseCounts(appState.logs, ex.id)
        out[ex.id] = counts.map(it => `${it.key} — ${it.count}x`)
      }
    }
    return out
  }, [appState.logs])

  const cueByExId = React.useMemo(() => {
    const out = {}
    for(const ex of day.exercises){
      const hasTodayState = Boolean(todaysLog?.[ex.id]?.state)
      out[ex.id] = hasTodayState ? '' : getLastCue(ex.id, appState.logs, date)
    }
    return out
  }, [appState.logs, day.exercises, date, todaysLog])

  function persist(next){
    setAppState(next)
    saveState(next)
  }

  function updateExercise(exId, patch){
    const next = ensureDayLog(deepClone(appState), date, activeDayKey)
    const dayLog = next.logs[date][activeDayKey]
    const prev = dayLog[exId] || {}
    dayLog[exId] = { ...prev, ...patch, updatedAt: Date.now() }
    persist(next)
  }

  function clearExercise(exId){
    const next = ensureDayLog(deepClone(appState), date, activeDayKey)
    if(next.logs?.[date]?.[activeDayKey]) delete next.logs[date][activeDayKey][exId]
    persist(next)
  }

  function openNote(exId){
    setNoteFor(exId)
    setNoteDraft((todaysLog && todaysLog[exId] && todaysLog[exId].note) || '')
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
    const ex = exerciseById(exId)
    if(!ex) return
    const entry = todaysLog[exId] || {}
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
    const ex = exerciseById(exId)
    if(!ex) return
    const entry = todaysLog[exId] || {}
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

  return (
    <div className="wrap">
      <header>
        <div className="title">
          <h1>The Practice</h1>
          <div className="subtitle">One set. Stable targets. Quick tweaks. Honest history.</div>
        </div>
      </header>
      <div className="grid">
        <div className="card">
          <div className="cardHeader">
            <h2>{day.name}</h2>
            <div className="dateNav">
              <button className="dateNavBtn" onClick={() => setDateOffset(v => v - 1)} title="Previous day">←</button>
              <div className="dayBadge">{date}</div>
              <button className="dateNavBtn" onClick={() => setDateOffset(v => v + 1)} title="Next day">→</button>
              {dateOffset !== 0 ? (
                <button className="dateNavBtn reset" onClick={() => setDateOffset(0)} title={`Back to ${today}`}>Today</button>
              ) : null}
            </div>
          </div>
          <div className="cardBody">
            <div className="list">
              {day.exercises.map(ex => (
                <ExerciseTile
                  key={ex.id}
                  exercise={ex}
                  entry={todaysLog[ex.id]}
                  cueText={cueByExId[ex.id]}
                  planEntry={appState.plan?.[ex.id]}
                  historyLines={historyByExId[ex.id]}
                  onSetState={(id, state) => updateExercise(id, { state })}
                  onAdjust={adjust}
                  onOpenDetails={openDetails}
                  onOpenNote={openNote}
                  onClear={clearExercise}
                  onOpenHelp={() => setShowStateHelp(true)}
                />
              ))}
            </div>

            <div className="footerHint">
              Tip: click an exercise name to see its full history.
            </div>
          </div>
        </div>
      </div>

      {noteFor ? (
        <Modal title="Add a note" onClose={() => setNoteFor(null)}>
          <div className="tiny" style={{marginBottom:8}}>
            One line is enough. (Example: “Contested early — slept badly.”)
          </div>
          <textarea value={noteDraft} onChange={(e)=>setNoteDraft(e.target.value)} placeholder="Write a short note…" />
          <div style={{display:'flex', gap:10, justifyContent:'flex-end', marginTop:10}}>
            <Button variant="ghost" onClick={() => setNoteFor(null)}>Cancel</Button>
            <Button variant="ok" onClick={saveNote}>Save</Button>
          </div>
        </Modal>
      ) : null}

      {detailsFor ? (
        (() => {
          const ex = exerciseById(detailsFor)
          if(!ex) return null
          const lines = historyByExId[detailsFor] || []
          const entry = todaysLog[detailsFor]
          const plan = appState.plan?.[detailsFor]
          const tgt = formatTarget(ex, entry, plan)

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

    </div>
  )
}
