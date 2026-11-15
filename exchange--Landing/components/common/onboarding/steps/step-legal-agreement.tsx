"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { OnboardingFormData } from "./types"

interface StepLegalAgreementProps {
    data: OnboardingFormData
    update: (key: keyof OnboardingFormData, value: string | boolean) => void
    onNext: () => void | Promise<void>
    onBack: () => void
    isSubmitting?: boolean
}

export function StepLegalAgreement({ data, update, onNext, onBack, isSubmitting = false }: StepLegalAgreementProps) {
    const { toast } = useToast()
    const scrollRef = useRef<HTMLDivElement>(null)
    const [scrolledToEnd, setScrolledToEnd] = useState(false)

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return

        const handleScroll = () => {
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
                setScrolledToEnd(true)
            }
        }

        el.addEventListener("scroll", handleScroll)
        return () => el.removeEventListener("scroll", handleScroll)
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!data.acceptJurisdiction) {
            toast({
                title: "Aceptación del acuerdo legal obligatoria",
                description: "Debes leer y aceptar las condiciones legales y restricciones jurisdiccionales para continuar con el registro.",
                variant: "neutral",
            })
            return
        }
        onNext()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold text-center">Acuerdo Legal de Jurisdicción</h2>

            <div
                ref={scrollRef}
                className="h-64 overflow-y-auto p-4 border rounded-md bg-muted text-sm text-muted-foreground space-y-2"
            >
                <p>
                    Al registrarte en deco-exchange, declaras entender y aceptar que este servicio se encuentra en etapa de desarrollo tecnológico y revisión regulatoria. La disponibilidad de productos, funciones y servicios está sujeta a las licencias, autorizaciones y restricciones aplicables en cada jurisdicción.
                </p>
                <p>
                    Este servicio no está autorizado ni destinado para su uso en jurisdicciones donde las leyes locales prohíban el acceso, comercio o uso de criptoactivos, ni en países donde no se cuente con los permisos regulatorios necesarios.
                </p>
                <p>
                    Está expresamente prohibido el acceso o registro a usuarios que sean ciudadanos, residentes o se encuentren físicamente en los siguientes países: <strong>Estados Unidos de América (EE.UU.)</strong>, <strong>Irán</strong>, <strong>Corea del Norte</strong>, <strong>Siria</strong>, <strong>Cuba</strong> y cualquier otra jurisdicción sancionada por la <a href="https://home.treasury.gov/policy-issues/office-of-foreign-assets-control-sanctions-programs-and-information" target="_blank" className="underline">OFAC</a> u organismos similares.
                </p>
                <p>
                    Si eres ciudadano de EE.UU. —incluso si resides fuera de su territorio— no debes registrarte. En caso de hacerlo, estarás violando este acuerdo, y deco-exchange se reserva el derecho de cancelar tu cuenta y reembolsar tus fondos, conforme a las regulaciones internacionales y las políticas internas de cumplimiento.
                </p>
                <p>
                    Este acuerdo constituye un compromiso legal vinculante entre el usuario y deco-exchange. Nos reservamos el derecho de modificar sus términos en cualquier momento y sin previo aviso.
                </p>
                <p>
                    Para más información, te invitamos a consultar los <a href="https://www.deco-exchange.com/legals" target="_blank" className="underline">Términos Legales de deco-exchange</a>.
                </p>
            </div>

            <div className="flex items-start gap-2">
                <Checkbox
                    id="jurisdiction"
                    checked={data.acceptJurisdiction}
                    onCheckedChange={(v) => update("acceptJurisdiction", v === true)}
                    disabled={!scrolledToEnd}
                />
                <Label htmlFor="jurisdiction" className="text-sm leading-snug text-muted-foreground">
                    He leído completamente y acepto el acuerdo legal y las restricciones de jurisdicción.
                </Label>
            </div>

            <div className="flex justify-between gap-2 pt-2">
                <Button type="button" onClick={onBack} variant="outline" className="w-full" disabled={isSubmitting}>
                    Atrás
                </Button>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registrando...
                        </>
                    ) : (
                        "Siguiente"
                    )}
                </Button>
            </div>
        </form>
    )
}
