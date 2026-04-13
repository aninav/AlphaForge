"use client"

import React, { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronDown, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export type ThemeToggleVariant = "button" | "switch" | "dropdown" | "tabs" | "grid" | "radial" | "cards"
export type ThemeToggleSize = "sm" | "md" | "lg"
export type Theme = "light" | "dark" | "system"

interface ThemeToggleProps {
  variant?: ThemeToggleVariant
  size?: ThemeToggleSize
  showLabel?: boolean
  themes?: Theme[]
  className?: string
}

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

export const themeConfigs: Record<Theme, { name: string; label: string }> = {
  light: { name: "light", label: "Light" },
  dark:  { name: "dark",  label: "Dark"  },
  system:{ name: "system",label: "System"},
}

export function Theme({
  variant = "button",
  size = "md",
  showLabel = false,
  themes = ["light", "dark", "system"],
  className,
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  const sizeClasses = {
    sm: "h-8 px-2 text-xs",
    md: "h-9 px-3 text-sm",
    lg: "h-10 px-4 text-sm",
  }
  const iconSizes = { sm: 13, md: 14, lg: 16 }

  if (!isMounted) return null

  function safeTheme(): Theme {
    if (theme && themes.includes(theme as Theme)) return theme as Theme
    return themes[0]
  }

  if (variant === "button") {
    const current = safeTheme()
    const next = themes[(themes.indexOf(current) + 1) % themes.length]
    const Icon = themeIcons[current]

    return (
      <motion.button
        onClick={() => setTheme(next)}
        className={cn(
          "inline-flex items-center justify-center gap-2 border transition-all duration-200",
          "border-forge-dim bg-forge-surface text-forge-body",
          "hover:border-forge-muted hover:text-forge-text",
          sizeClasses[size],
          className
        )}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        aria-label="Toggle theme"
      >
        <motion.div
          key={current}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <Icon size={iconSizes[size]} />
        </motion.div>
        {showLabel && (
          <span className="font-mono tracking-wider">{themeConfigs[current].label}</span>
        )}
      </motion.button>
    )
  }

  if (variant === "switch") {
    const isLight = theme === "light"
    return (
      <motion.button
        onClick={() => setTheme(isLight ? "dark" : "light")}
        className={cn(
          "relative inline-flex items-center rounded-full border-2 transition-all duration-300",
          "border-forge-dim bg-forge-surface",
          size === "sm" ? "h-6 w-11" : size === "md" ? "h-7 w-13" : "h-8 w-15",
          className
        )}
        aria-label="Toggle light/dark"
      >
        <motion.div
          className={cn(
            "inline-flex items-center justify-center rounded-full shadow-lg",
            "bg-forge-muted",
            size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6"
          )}
          animate={{ x: isLight ? 2 : size === "sm" ? 22 : size === "md" ? 26 : 30 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <motion.div
            key={theme}
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            {isLight
              ? <Sun size={size === "sm" ? 10 : 12} className="text-forge-text" />
              : <Moon size={size === "sm" ? 10 : 12} className="text-forge-text" />
            }
          </motion.div>
        </motion.div>
      </motion.button>
    )
  }

  if (variant === "dropdown") {
    const current = safeTheme()
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            className={cn(
              "inline-flex items-center gap-2 border transition-all duration-200",
              "border-forge-dim bg-forge-surface text-forge-body",
              "hover:border-forge-muted hover:text-forge-text",
              sizeClasses[size],
              showLabel && "min-w-[100px] justify-between",
              !showLabel && "justify-center",
              className
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2">
              {React.createElement(themeIcons[current], { size: iconSizes[size] })}
              {showLabel && <span className="font-mono tracking-wider">{themeConfigs[current].label}</span>}
            </div>
            {showLabel && <ChevronDown size={iconSizes[size]} />}
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="border-forge-dim bg-forge-panel text-forge-body min-w-[120px]"
        >
          {themes.map((t) => {
            const Icon = themeIcons[t]
            const isSelected = theme === t
            return (
              <DropdownMenuItem
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  "flex items-center justify-between gap-2 font-mono text-xs tracking-wider cursor-pointer",
                  "focus:bg-forge-surface focus:text-forge-text",
                  isSelected && "text-forge-text"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon size={iconSizes[size]} />
                  <span>{themeConfigs[t].label}</span>
                </div>
                {isSelected && <Check size={iconSizes[size]} />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (variant === "tabs") {
    return (
      <Tabs value={theme} onValueChange={setTheme} className={cn(className)}>
        <TabsList className="border border-forge-dim bg-forge-surface p-0.5">
          {themes.map((t) => {
            const Icon = themeIcons[t]
            const isSelected = theme === t
            return (
              <TabsTrigger
                key={t}
                value={t}
                className={cn(
                  "relative font-mono text-xs tracking-wider gap-1",
                  "data-[state=active]:bg-forge-panel data-[state=active]:text-forge-text",
                  "text-forge-body",
                  size === "sm" ? "h-6 px-2" : size === "md" ? "h-7 px-3" : "h-8 px-4"
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="theme-tab-bg"
                    className="absolute inset-0 bg-forge-panel"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-1">
                  <Icon size={size === "sm" ? 11 : size === "md" ? 13 : 15} />
                  {showLabel && <span>{themeConfigs[t].label}</span>}
                </div>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>
    )
  }

  return null
}
