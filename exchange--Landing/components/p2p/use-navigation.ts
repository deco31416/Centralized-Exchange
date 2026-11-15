"use client"

import { useContext } from "react"
import { NavigationContext } from "@/components/p2p/navigation-provider"

export const useNavigation = () => useContext(NavigationContext)
