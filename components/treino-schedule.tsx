"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dumbbell,
  PersonStanding,
  Footprints,
  Pencil,
  Plus,
  Trash2,
  Save,
  X,
  History,
  User,
  LogOut,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type WorkoutBlock = { title: string; exercises: string[] }
type UserType = { id: string; name: string }
type WorkoutHistoryEntry = {
  id: string
  day_of_week: string
  workout_data: WorkoutBlock[]
  completed_at: string
  week_number?: number
  year?: number
}

interface TreinoScheduleProps {
  userEmail?: string
}

function getWeekNumber(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return { week, year: d.getUTCFullYear() }
}

function getWeekDateRange(year: number, week: number): { start: Date; end: Date } {
  const jan1 = new Date(year, 0, 1)
  const daysOffset = (week - 1) * 7
  const start = new Date(jan1.getTime() + daysOffset * 86400000)
  // Adjust to Monday
  const dayOfWeek = start.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  start.setDate(start.getDate() + diff)
  const end = new Date(start.getTime() + 6 * 86400000)
  return { start, end }
}

const initialWorkoutsByDay: Record<string, WorkoutBlock[]> = {
  SEG: [
    {
      title: "TREINO SEG - Caminhada",
      exercises: ["Caminhada Rua/Esteira Incl. 15%", "Aquecimento 10min", "Core 15min", "Alongamento Final"],
    },
  ],
  TER: [
    {
      title: "TREINO TER - Costa e Bíceps",
      exercises: [
        "Puxada Frontal",
        "Remada Curvada",
        "Remada Unilateral",
        "Pulldown",
        "Rosca Direta",
        "Rosca Alternada",
        "Rosca Martelo",
      ],
    },
    {
      title: "CARDIO",
      exercises: ["Esteira 20min", "Spinning 15min"],
    },
  ],
  QUA: [
    {
      title: "PERNA 1",
      exercises: ["Mesa Flexora", "Flexora Unilateral", "Abdutora em Pé", "Elevação Pélvica", "Stiff + Panturrilha"],
    },
  ],
  QUI: [
    {
      title: "TREINO QUI - Ombro",
      exercises: [
        "Desenvolvimento Máquina",
        "Elevação Lateral",
        "Elevação Frontal",
        "Crucifixo Inverso",
        "Encolhimento",
      ],
    },
    {
      title: "CARDIO",
      exercises: ["Spinner 30min"],
    },
  ],
  SEX: [
    {
      title: "TREINO SEX - Escada",
      exercises: ["Escada 2h", "Intervalo Hidratação", "Alongamento"],
    },
  ],
  SAB: [
    {
      title: "TREINO SAB - Peito e Tríceps",
      exercises: [
        "Supino Reto",
        "Supino Inclinado",
        "Crucifixo Máquina",
        "Crossover",
        "Tríceps Pulley",
        "Tríceps Francês",
        "Tríceps Testa",
      ],
    },
    {
      title: "CARDIO",
      exercises: ["Esteira 20min"],
    },
  ],
  DOM: [
    {
      title: "PERNA 2",
      exercises: ["Agachamento", "Passada", "Leg Press", "Extensora", "Coice Polia +", "Bulgaro + Panturrilha"],
    },
  ],
}

export function TreinoSchedule({ userEmail }: TreinoScheduleProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [workoutsByDay, setWorkoutsByDay] = useState(initialWorkoutsByDay)
  const [isEditing, setIsEditing] = useState(false)
  const [editingWorkouts, setEditingWorkouts] = useState<WorkoutBlock[]>([])

  const [users, setUsers] = useState<UserType[]>([])
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const today = new Date()
  const currentWeekInfo = getWeekNumber(today)
  const [selectedWeek, setSelectedWeek] = useState(currentWeekInfo.week)
  const [selectedYear, setSelectedYear] = useState(currentWeekInfo.year)
  const [weeklyLogs, setWeeklyLogs] = useState<Record<string, WorkoutBlock[]>>({})

  const [isEditingNames, setIsEditingNames] = useState(false)
  const [editingUserNames, setEditingUserNames] = useState<Record<string, string>>({})

  const supabase = createClient()
  const router = useRouter()
  const weekDays = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"]

  const dailySchedule = [
    { day: "SEG", icon: PersonStanding, activity: "Caminhada Rua/\nEsteira Incl. 15%" },
    { day: "TER", icon: Dumbbell, activity: "Costa, Bíceps\nCardio" },
    { day: "QUA", icon: Footprints, activity: "PERNA 1" },
    { day: "QUI", icon: PersonStanding, activity: "Ombro, Spinner 30min" },
    { day: "SEX", icon: PersonStanding, activity: "Escada 2h" },
    { day: "SAB", icon: PersonStanding, activity: "Peito, Tríceps Cardio" },
    { day: "DOM", icon: Footprints, activity: "PERNA 2" },
  ]

  const perna1 = ["Mesa Flexora", "Flexora Unilateral", "Abdutora em Pé", "Elevação Pélvica", "Stiff + Panturrilha"]
  const perna2 = ["Agachamento", "Passada", "Leg Press", "Extensora", "Coice Polia +", "Bulgaro + Panturrilha"]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  const handleSaveNames = async () => {
    const updatedUsers = users.map((user) => ({
      ...user,
      name: editingUserNames[user.id] || user.name,
    }))

    // Update in database
    for (const user of updatedUsers) {
      await supabase.from("users").update({ name: user.name }).eq("id", user.id)
    }

    setUsers(updatedUsers)
    setIsEditingNames(false)
  }

  const handleStartEditNames = () => {
    const namesMap: Record<string, string> = {}
    users.forEach((user) => {
      namesMap[user.id] = user.name
    })
    setEditingUserNames(namesMap)
    setIsEditingNames(true)
  }

  const handleCancelEditNames = () => {
    setIsEditingNames(false)
    setEditingUserNames({})
  }

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase.from("users").select("*").order("name")
      console.log("[v0] Fetched users:", data, error)
      if (data && data.length > 0) {
        setUsers(data)
      } else {
        console.log("[v0] No users found, creating defaults...")
        setUsers([
          { id: "fabio-temp", name: "Fabio" },
          { id: "claudia-temp", name: "Claudia" },
        ])
      }
      setIsLoading(false)
    }
    fetchUsers()
  }, [])

  const fetchUserWorkouts = useCallback(
    async (userId: string) => {
      const { data } = await supabase.from("workouts").select("*").eq("user_id", userId)

      if (data && data.length > 0) {
        const workoutsMap: Record<string, WorkoutBlock[]> = { ...initialWorkoutsByDay }
        data.forEach((w) => {
          workoutsMap[w.day_of_week] = w.workout_data as WorkoutBlock[]
        })
        setWorkoutsByDay(workoutsMap)
      } else {
        setWorkoutsByDay(initialWorkoutsByDay)
      }
    },
    [supabase],
  )

  const fetchWeeklyLogs = useCallback(
    async (userId: string, year: number, week: number) => {
      const { data } = await supabase
        .from("weekly_workout_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("year", year)
        .eq("week_number", week)

      const logs: Record<string, WorkoutBlock[]> = {}
      if (data) {
        data.forEach((log) => {
          logs[log.day_of_week] = log.workout_data as WorkoutBlock[]
        })
      }
      setWeeklyLogs(logs)
    },
    [supabase],
  )

  const fetchHistory = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("workout_history")
        .select("*")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false })
        .limit(20)

      if (data) {
        setHistory(data as WorkoutHistoryEntry[])
      }
    },
    [supabase],
  )

  useEffect(() => {
    if (selectedUser) {
      fetchUserWorkouts(selectedUser.id)
      fetchHistory(selectedUser.id)
      fetchWeeklyLogs(selectedUser.id, selectedYear, selectedWeek)
    }
  }, [selectedUser, fetchUserWorkouts, fetchHistory, fetchWeeklyLogs, selectedYear, selectedWeek])

  const currentWorkout = selectedDay ? weeklyLogs[selectedDay] || workoutsByDay[selectedDay] : null

  const hasWeeklyLog = selectedDay ? !!weeklyLogs[selectedDay] : false

  const handleSelectUser = (user: UserType) => {
    setSelectedUser(user)
    setSelectedDay(null)
    setIsEditing(false)
    setShowHistory(false)
  }

  const handleStartEdit = () => {
    if (selectedDay && currentWorkout) {
      setEditingWorkouts(JSON.parse(JSON.stringify(currentWorkout)))
      setIsEditing(true)
    }
  }

  const handleSaveEdit = async () => {
    if (selectedDay && selectedUser) {
      setIsSaving(true)

      // Save to weekly logs (specific to this week)
      await supabase.from("weekly_workout_logs").upsert(
        {
          user_id: selectedUser.id,
          year: selectedYear,
          week_number: selectedWeek,
          day_of_week: selectedDay,
          workout_data: editingWorkouts,
          logged_at: new Date().toISOString(),
        },
        { onConflict: "user_id,year,week_number,day_of_week" },
      )

      // Also save to history
      await supabase.from("workout_history").insert({
        user_id: selectedUser.id,
        day_of_week: selectedDay,
        workout_data: editingWorkouts,
        week_number: selectedWeek,
        year: selectedYear,
      })

      // Update local state
      setWeeklyLogs((prev) => ({
        ...prev,
        [selectedDay]: editingWorkouts,
      }))

      fetchHistory(selectedUser.id)
      setIsEditing(false)
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingWorkouts([])
  }

  const handleAddExercise = (workoutIndex: number) => {
    setEditingWorkouts((prev) => {
      const updated = [...prev]
      updated[workoutIndex] = {
        ...updated[workoutIndex],
        exercises: [...updated[workoutIndex].exercises, ""],
      }
      return updated
    })
  }

  const handleRemoveExercise = (workoutIndex: number, exerciseIndex: number) => {
    setEditingWorkouts((prev) => {
      const updated = [...prev]
      updated[workoutIndex] = {
        ...updated[workoutIndex],
        exercises: updated[workoutIndex].exercises.filter((_, i) => i !== exerciseIndex),
      }
      return updated
    })
  }

  const handleExerciseChange = (workoutIndex: number, exerciseIndex: number, value: string) => {
    setEditingWorkouts((prev) => {
      const updated = [...prev]
      updated[workoutIndex] = {
        ...updated[workoutIndex],
        exercises: updated[workoutIndex].exercises.map((ex, i) => (i === exerciseIndex ? value : ex)),
      }
      return updated
    })
  }

  const handleTitleChange = (workoutIndex: number, value: string) => {
    setEditingWorkouts((prev) => {
      const updated = [...prev]
      updated[workoutIndex] = {
        ...updated[workoutIndex],
        title: value,
      }
      return updated
    })
  }

  const handleAddWorkout = () => {
    setEditingWorkouts((prev) => [...prev, { title: "NOVO TREINO", exercises: [""] }])
  }

  const handleRemoveWorkout = (workoutIndex: number) => {
    setEditingWorkouts((prev) => prev.filter((_, i) => i !== workoutIndex))
  }

  const handlePrevWeek = () => {
    if (selectedWeek === 1) {
      setSelectedWeek(52)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedWeek(selectedWeek - 1)
    }
  }

  const handleNextWeek = () => {
    if (selectedWeek === 52) {
      setSelectedWeek(1)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedWeek(selectedWeek + 1)
    }
  }

  const handleCurrentWeek = () => {
    setSelectedWeek(currentWeekInfo.week)
    setSelectedYear(currentWeekInfo.year)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDayFullName = (day: string) => {
    const names: Record<string, string> = {
      SEG: "SEGUNDA",
      TER: "TERÇA",
      QUA: "QUARTA",
      QUI: "QUINTA",
      SEX: "SEXTA",
      SAB: "SÁBADO",
      DOM: "DOMINGO",
    }
    return names[day] || day
  }

  const weekRange = getWeekDateRange(selectedYear, selectedWeek)
  const formatShortDate = (date: Date) => date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })

  const isCurrentWeek = selectedWeek === currentWeekInfo.week && selectedYear === currentWeekInfo.year

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030a14]">
        <div className="text-cyan-400 animate-pulse">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen p-4 md:p-8 font-mono">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#051525] via-[#030a14] to-[#051525] pointer-events-none" />
      <div className="fixed top-0 left-0 right-0 h-24 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />

      {/* Horizontal scan lines effect */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.03) 2px, rgba(0,255,255,0.03) 4px)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Title with decorative border */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-cyan-400/10 to-transparent blur-sm" />
            <div className="relative flex items-center">
              <div className="h-0.5 w-8 bg-gradient-to-r from-transparent to-cyan-400" />
              <div
                className="border-2 border-cyan-400/80 px-6 py-3 bg-[#030a14]/80 backdrop-blur-sm
                clip-path-angled relative"
              >
                <div className="absolute inset-0 bg-cyan-400/5" />
                <h1
                  className="text-3xl md:text-4xl font-bold tracking-wider text-white"
                  style={{ textShadow: "0 0 20px rgba(0,255,255,0.5)" }}
                >
                  TREINO 2026
                </h1>
              </div>
              <div className="h-0.5 w-8 bg-gradient-to-r from-cyan-400 to-transparent" />
            </div>
          </div>

          <div className="flex items-center gap-2 border border-cyan-500/50 rounded-lg px-4 py-2 bg-[#030a14]/80 backdrop-blur-sm">
            <User className="w-5 h-5 text-cyan-400" />

            {isEditingNames ? (
              <div className="flex items-center gap-2">
                {users.map((user) => (
                  <input
                    key={user.id}
                    type="text"
                    value={editingUserNames[user.id] || ""}
                    onChange={(e) =>
                      setEditingUserNames((prev) => ({
                        ...prev,
                        [user.id]: e.target.value,
                      }))
                    }
                    className="w-24 px-2 py-1 bg-transparent border-b border-cyan-400 text-cyan-100 
                      focus:outline-none focus:border-cyan-300 text-center font-bold"
                    placeholder="Nome"
                  />
                ))}
                <button
                  onClick={handleSaveNames}
                  className="p-1.5 text-green-400 hover:bg-green-500/20 rounded transition-all"
                  title="Salvar"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEditNames}
                  className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-all"
                  title="Cancelar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className={`px-4 py-2 rounded font-bold transition-all duration-300
                        ${
                          selectedUser?.id === user.id
                            ? "bg-cyan-500/30 text-cyan-100 shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                            : "text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-100"
                        }`}
                    >
                      {user.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleStartEditNames}
                  className="p-1.5 text-cyan-400/60 hover:text-cyan-300 hover:bg-cyan-500/20 rounded transition-all"
                  title="Editar Nomes"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </>
            )}

            {!isEditingNames && selectedUser && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`ml-2 p-2 rounded transition-all duration-300
                  ${showHistory ? "bg-cyan-500/30 text-cyan-100" : "text-cyan-400 hover:bg-cyan-500/20"}`}
                title="Ver Histórico"
              >
                <History className="w-5 h-5" />
              </button>
            )}
            {!isEditingNames && (
              <button
                onClick={handleLogout}
                className="ml-2 p-2 rounded text-red-400 hover:bg-red-500/20 transition-all duration-300"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>

        {userEmail && (
          <div className="text-center text-cyan-400/60 text-sm">
            Logado como: <span className="text-cyan-300">{userEmail}</span>
          </div>
        )}

        {selectedUser && !showHistory && (
          <div className="border border-cyan-500/50 bg-[#030a14]/90 p-3 flex items-center justify-between">
            <button onClick={handlePrevWeek} className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <div className="text-center">
                <div className="text-cyan-300 font-bold">
                  SEMANA {selectedWeek} / {selectedYear}
                </div>
                <div className="text-cyan-400/60 text-xs">
                  {formatShortDate(weekRange.start)} - {formatShortDate(weekRange.end)}
                </div>
              </div>
              {!isCurrentWeek && (
                <button
                  onClick={handleCurrentWeek}
                  className="text-xs px-2 py-1 border border-cyan-500/50 text-cyan-300 rounded hover:bg-cyan-500/20 transition-all"
                >
                  HOJE
                </button>
              )}
              {isCurrentWeek && <span className="text-xs px-2 py-1 bg-cyan-500/30 text-cyan-100 rounded">ATUAL</span>}
            </div>

            <button onClick={handleNextWeek} className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {!selectedUser ? (
          <div className="border border-cyan-500/50 bg-[#030a14]/90 p-8 text-center">
            <User className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <p className="text-cyan-300 text-lg">Selecione um usuário para ver os treinos</p>
            <p className="text-cyan-400/60 text-sm mt-2">Clique em Fabio ou Claudia acima</p>
          </div>
        ) : showHistory ? (
          /* History view */
          <div className="border border-cyan-500/50 bg-[#030a14]/90 p-4 relative">
            <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-400" />
            <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-400" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400" />

            <div className="flex items-center justify-between mb-4 border-b border-cyan-500/30 pb-2">
              <h2 className="text-cyan-300 font-bold flex items-center gap-2">
                <History className="w-5 h-5" />
                HISTÓRICO DE {selectedUser.name.toUpperCase()}
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-cyan-400/60 text-center py-8">Nenhum histórico encontrado</p>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {history.map((entry) => (
                  <div key={entry.id} className="border border-cyan-500/30 p-3 rounded bg-cyan-900/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-cyan-300 font-bold">{getDayFullName(entry.day_of_week)}</span>
                      <div className="text-right">
                        <span className="text-cyan-400/60 text-sm">{formatDate(entry.completed_at)}</span>
                        {entry.week_number && (
                          <span className="text-cyan-500/60 text-xs ml-2">
                            Sem {entry.week_number}/{entry.year}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {entry.workout_data.map((workout, i) => (
                        <div key={i} className="text-sm">
                          <span className="text-cyan-200 font-semibold">{workout.title}:</span>
                          <span className="text-cyan-400/80 ml-2">{workout.exercises.length} exercícios</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Main content grid */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
            {/* Left side - Schedule tables */}
            <div className="space-y-0">
              {/* Schedule box with decorative corners */}
              <div className="relative border border-cyan-500/50 bg-[#030a14]/90 p-4">
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-400" />
                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400" />

                <div className="mb-4 text-center">
                  <span className="text-cyan-400/60 text-sm">Treino de</span>
                  <span className="text-cyan-300 font-bold ml-2">{selectedUser.name}</span>
                </div>

                <div className="mb-6">
                  <div className="grid grid-cols-7 text-center text-sm mb-2">
                    {weekDays.map((day, i) => (
                      <button
                        key={day}
                        onClick={() => {
                          setSelectedDay(selectedDay === day ? null : day)
                          setIsEditing(false)
                        }}
                        className={`py-2 border-b border-cyan-500/30 transition-all duration-300 cursor-pointer relative
                        ${i < 6 ? "border-r border-cyan-500/30" : ""}
                        ${
                          selectedDay === day
                            ? "text-cyan-100 bg-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.3)]"
                            : "text-cyan-300 hover:text-cyan-100 hover:bg-cyan-500/10"
                        }`}
                      >
                        {day}
                        {i < 6 && <span className="text-cyan-500/50 ml-1">›</span>}
                        {/* Indicator for logged workouts */}
                        {weeklyLogs[day] && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Activity rows */}
                  <div className="border border-cyan-500/40 mb-2">
                    <div className="bg-cyan-900/20 py-2 px-3 text-center text-cyan-100 border-b border-cyan-500/30 text-sm">
                      — Caminhada Rua/Esteira Incl. 15%
                    </div>
                    <div className="grid grid-cols-1 text-cyan-200 text-sm">
                      <div className="py-1.5 px-3 border-b border-cyan-500/20">Aquec/Core 15min</div>
                      <div className="py-1.5 px-3 border-b border-cyan-500/20">Musculação 45min</div>
                      <div className="py-1.5 px-3">Cardio Escada o Spinning</div>
                    </div>
                  </div>
                </div>

                {selectedDay && currentWorkout ? (
                  <>
                    {/* Header with edit button */}
                    <div className="flex items-center justify-between mb-4 border-b border-cyan-500/30 pb-2">
                      <h2 className="text-cyan-300 font-bold flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                        TREINO DE {getDayFullName(selectedDay)}
                        {hasWeeklyLog && (
                          <span className="text-xs px-2 py-0.5 bg-green-500/30 text-green-300 rounded ml-2">
                            REGISTRADO
                          </span>
                        )}
                      </h2>
                      {!isEditing ? (
                        <button
                          onClick={handleStartEdit}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-cyan-300 border border-cyan-500/50 
                            rounded hover:bg-cyan-500/20 transition-all duration-300 hover:shadow-[0_0_10px_rgba(0,255,255,0.3)]"
                        >
                          <Pencil className="w-4 h-4" />
                          Editar Treino
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSaveEdit}
                            disabled={isSaving}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-300 border border-green-500/50 
                              rounded hover:bg-green-500/20 transition-all duration-300 disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                            {isSaving ? "Salvando..." : "Salvar"}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-300 border border-red-500/50 
                              rounded hover:bg-red-500/20 transition-all duration-300"
                          >
                            <X className="w-4 h-4" />
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Workout content */}
                    {isEditing ? (
                      <div className="space-y-4">
                        {editingWorkouts.map((workout, workoutIndex) => (
                          <div key={workoutIndex} className="border border-cyan-500/30 p-3 rounded bg-cyan-900/10">
                            <div className="flex items-center gap-2 mb-3">
                              <input
                                type="text"
                                value={workout.title}
                                onChange={(e) => handleTitleChange(workoutIndex, e.target.value)}
                                className="flex-1 bg-transparent border-b border-cyan-500/50 text-cyan-200 font-bold 
                                  focus:outline-none focus:border-cyan-400 py-1"
                              />
                              <button
                                onClick={() => handleRemoveWorkout(workoutIndex)}
                                className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <ul className="space-y-2">
                              {workout.exercises.map((exercise, exerciseIndex) => (
                                <li key={exerciseIndex} className="flex items-center gap-2">
                                  <span className="text-cyan-400">•</span>
                                  <input
                                    type="text"
                                    value={exercise}
                                    onChange={(e) => handleExerciseChange(workoutIndex, exerciseIndex, e.target.value)}
                                    className="flex-1 bg-transparent border-b border-cyan-500/30 text-cyan-200 
                                      focus:outline-none focus:border-cyan-400 py-1 text-sm"
                                    placeholder="Nome do exercício"
                                  />
                                  <button
                                    onClick={() => handleRemoveExercise(workoutIndex, exerciseIndex)}
                                    className="p-1 text-red-400/60 hover:text-red-400 hover:bg-red-500/20 rounded transition-all"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </li>
                              ))}
                            </ul>

                            <button
                              onClick={() => handleAddExercise(workoutIndex)}
                              className="mt-2 flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Adicionar exercício
                            </button>
                          </div>
                        ))}

                        <button
                          onClick={handleAddWorkout}
                          className="w-full py-2 border border-dashed border-cyan-500/50 text-cyan-400 
                            hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300 rounded
                            flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar Bloco de Treino
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentWorkout.map((workout, index) => (
                          <div key={index} className="border border-cyan-500/40 p-3">
                            <h4 className="text-cyan-200 font-bold text-center border-b border-cyan-500/30 pb-2 mb-3">
                              {workout.title}
                            </h4>
                            <ul className="space-y-1.5">
                              {workout.exercises.map((exercise, i) => (
                                <li key={i} className="flex items-center gap-2 text-cyan-300 text-sm">
                                  <span className="text-cyan-400">•</span>
                                  {exercise}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  /* Default view - PERNA 1 / PERNA 2 */
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-cyan-500/40 p-3">
                      <h4 className="text-cyan-200 font-bold text-center border-b border-cyan-500/30 pb-2 mb-3">
                        PERNA 1
                      </h4>
                      <ul className="space-y-1.5">
                        {perna1.map((exercise, i) => (
                          <li key={i} className="flex items-center gap-2 text-cyan-300 text-sm">
                            <span className="text-cyan-400">•</span>
                            {exercise}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border border-cyan-500/40 p-3">
                      <h4 className="text-cyan-200 font-bold text-center border-b border-cyan-500/30 pb-2 mb-3">
                        PERNA 2
                      </h4>
                      <ul className="space-y-1.5">
                        {perna2.map((exercise, i) => (
                          <li key={i} className="flex items-center gap-2 text-cyan-300 text-sm">
                            <span className="text-cyan-400">•</span>
                            {exercise}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Daily schedule sidebar */}
            <div className="w-full lg:w-48">
              <div className="border border-cyan-500/40 bg-[#030a14]/90 divide-y divide-cyan-500/20">
                {dailySchedule.map((item) => {
                  const IconComponent = item.icon
                  const hasLog = !!weeklyLogs[item.day]
                  return (
                    <button
                      key={item.day}
                      onClick={() => {
                        setSelectedDay(selectedDay === item.day ? null : item.day)
                        setIsEditing(false)
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 transition-all duration-300 text-left relative
                        ${
                          selectedDay === item.day
                            ? "bg-cyan-500/20 shadow-[inset_0_0_20px_rgba(0,255,255,0.1)]"
                            : "hover:bg-cyan-500/10"
                        }`}
                    >
                      <IconComponent
                        className={`w-6 h-6 ${selectedDay === item.day ? "text-cyan-300" : "text-cyan-500/70"}`}
                      />
                      <div className="flex-1">
                        <div
                          className={`text-sm font-bold ${selectedDay === item.day ? "text-cyan-200" : "text-cyan-400"}`}
                        >
                          {item.day}
                        </div>
                        <div className="text-xs text-cyan-400/60 whitespace-pre-line leading-tight">
                          {item.activity}
                        </div>
                      </div>
                      {hasLog && <span className="w-2 h-2 bg-green-400 rounded-full absolute top-2 right-2" />}
                    </button>
                  )
                })}
              </div>

              {/* Dotted decoration */}
              <div className="mt-4 px-2">
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-500/30" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
