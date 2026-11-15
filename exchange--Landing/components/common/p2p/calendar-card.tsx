import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function CalendarCard() {
  const days = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"]
  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleString("es", { month: "long" })
  const currentYear = currentDate.getFullYear()

  // Generar días del mes actual
  const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1).getDay()

  const calendarDays = []

  // Días del mes anterior
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ day: "", isCurrentMonth: false, isToday: false })
  }

  // Días del mes actual
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      isToday: i === currentDate.getDate(),
    })
  }

  // Completar la última semana si es necesario
  const remainingDays = 7 - (calendarDays.length % 7 || 7)
  if (remainingDays < 7) {
    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push({ day: i, isCurrentMonth: false, isToday: false })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 space-y-0">
        <CardTitle className="text-sm font-medium">
          {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)} {currentYear}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {days.map((day) => (
            <div key={day} className="py-1 text-muted-foreground">
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`rounded-md py-1.5 ${
                day.isToday
                  ? "bg-primary text-primary-foreground"
                  : day.isCurrentMonth
                    ? "hover:bg-secondary"
                    : "text-muted-foreground opacity-50"
              }`}
            >
              {day.day}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
