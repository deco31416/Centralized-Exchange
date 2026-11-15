"use client"

import * as React from "react"
import { Filter, ChevronDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

interface P2PFiltersProps extends React.HTMLAttributes<HTMLDivElement> {
  onFilterChange?: (filters: any) => void
}

export function P2PFilters({ className, onFilterChange, ...props }: P2PFiltersProps) {
  const [amount, setAmount] = React.useState("")
  const [currency, setCurrency] = React.useState("USD")
  const [paymentMethod, setPaymentMethod] = React.useState("Todos los métodos de pago")
  const [activeFilters, setActiveFilters] = React.useState<string[]>([])
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = React.useState(false)
  const [completionRate, setCompletionRate] = React.useState([80])
  const [orderCount, setOrderCount] = React.useState([10])
  const [availablePaymentMethods, setAvailablePaymentMethods] = React.useState([
    { id: "all", name: "Todos los métodos de pago", checked: true },
    { id: "acleda", name: "ACLEDA Bank", checked: false },
    { id: "wing", name: "Wing Money", checked: false },
    { id: "aba", name: "ABA", checked: false },
    { id: "khor", name: "KHOR", checked: false },
    { id: "ppcbank", name: "PPCBank Cambodia", checked: false },
    { id: "transfer", name: "Transferencia bancaria", checked: false },
    { id: "paypal", name: "PayPal", checked: false },
    { id: "wise", name: "Wise", checked: false },
  ])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
    updateFilters("amount", e.target.value)
  }

  const handleCurrencyChange = (value: string) => {
    setCurrency(value)
    updateFilters("currency", value)
  }

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value)
    updateFilters("paymentMethod", value)

    if (value !== "Todos los métodos de pago" && !activeFilters.includes("payment")) {
      setActiveFilters([...activeFilters, "payment"])
    }
  }

  const updateFilters = (key: string, value: any) => {
    if (onFilterChange) {
      onFilterChange({ amount, currency, paymentMethod, [key]: value })
    }
  }

  const handleRemoveFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter))

    if (filter === "payment") {
      setPaymentMethod("Todos los métodos de pago")
      updateFilters("paymentMethod", "Todos los métodos de pago")
    } else if (filter === "amount") {
      setAmount("")
      updateFilters("amount", "")
    }
  }

  const handleApplyAdvancedFilters = () => {
    const newFilters = [...activeFilters]

    if (completionRate[0] > 80 && !newFilters.includes("completion")) {
      newFilters.push("completion")
    } else if (completionRate[0] <= 80 && newFilters.includes("completion")) {
      const index = newFilters.indexOf("completion")
      newFilters.splice(index, 1)
    }

    if (orderCount[0] > 10 && !newFilters.includes("orders")) {
      newFilters.push("orders")
    } else if (orderCount[0] <= 10 && newFilters.includes("orders")) {
      const index = newFilters.indexOf("orders")
      newFilters.splice(index, 1)
    }

    setActiveFilters(newFilters)
    setAdvancedFiltersOpen(false)

    // Actualizar filtros para el componente padre
    if (onFilterChange) {
      onFilterChange({
        amount,
        currency,
        paymentMethod,
        completionRate: completionRate[0],
        orderCount: orderCount[0],
      })
    }
  }

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Importe de la transacción"
              value={amount}
              onChange={handleAmountChange}
              className="pr-16"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full gap-1 rounded-l-none border-l px-2"
                >
                  {currency}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Moneda</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => handleCurrencyChange("USD")}>USD</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCurrencyChange("EUR")}>EUR</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCurrencyChange("GBP")}>GBP</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between">
                {paymentMethod}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px]">
              <DropdownMenuLabel>Métodos de pago</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => handlePaymentMethodChange("Todos los métodos de pago")}>
                  Todos los métodos de pago
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePaymentMethodChange("ACLEDA Bank")}>
                  ACLEDA Bank
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePaymentMethodChange("Wing Money")}>Wing Money</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePaymentMethodChange("ABA")}>ABA</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePaymentMethodChange("KHOR")}>KHOR</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePaymentMethodChange("PPCBank Cambodia")}>
                  PPCBank Cambodia
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePaymentMethodChange("Transferencia bancaria")}>
                  Transferencia bancaria
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePaymentMethodChange("PayPal")}>PayPal</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePaymentMethodChange("Wise")}>Wise</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Dialog open={advancedFiltersOpen} onOpenChange={setAdvancedFiltersOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Filtros avanzados</DialogTitle>
              <DialogDescription>Personaliza tu búsqueda con filtros adicionales</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Métodos de pago</h3>
                <div className="grid grid-cols-2 gap-3">
                  {availablePaymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`payment-${method.id}`}
                        checked={method.checked}
                        onCheckedChange={(checked) => {
                          setAvailablePaymentMethods(
                            availablePaymentMethods.map((m) =>
                              m.id === method.id ? { ...m, checked: checked === true } : m,
                            ),
                          )
                        }}
                      />
                      <label
                        htmlFor={`payment-${method.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {method.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Tasa de finalización</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Min: {completionRate[0]}%</span>
                  </div>
                  <Slider
                    defaultValue={[80]}
                    max={100}
                    min={0}
                    step={5}
                    value={completionRate}
                    onValueChange={setCompletionRate}
                    className="my-2"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Número mínimo de órdenes</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Min: {orderCount[0]}</span>
                  </div>
                  <Slider
                    defaultValue={[10]}
                    max={1000}
                    min={0}
                    step={10}
                    value={orderCount}
                    onValueChange={setOrderCount}
                    className="my-2"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAdvancedFiltersOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleApplyAdvancedFilters}>Aplicar filtros</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input type="text" placeholder="Buscar comerciante" className="pl-10" />
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.includes("payment") && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {paymentMethod}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => handleRemoveFilter("payment")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {amount && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {amount} {currency}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => handleRemoveFilter("amount")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {activeFilters.includes("completion") && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Finalización ≥ {completionRate[0]}%
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => handleRemoveFilter("completion")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {activeFilters.includes("orders") && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Órdenes ≥ {orderCount[0]}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => handleRemoveFilter("orders")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {activeFilters.length > 1 && (
            <Button
              variant="link"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => {
                setActiveFilters([])
                setAmount("")
                setPaymentMethod("Todos los métodos de pago")
                setCompletionRate([80])
                setOrderCount([10])

                if (onFilterChange) {
                  onFilterChange({
                    amount: "",
                    currency,
                    paymentMethod: "Todos los métodos de pago",
                    completionRate: 80,
                    orderCount: 10,
                  })
                }
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
