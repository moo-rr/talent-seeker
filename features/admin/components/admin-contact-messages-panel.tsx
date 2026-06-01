"use client"

import { useState, useTransition, useMemo, useEffect } from "react"
import type { ContactMessage } from "@/lib/api/services/contact-messages.service"
import { deleteContactMessageAction } from "@/features/admin/actions/admin-actions"
import { Mail, Phone, Trash2, Eye, EyeOff, Calendar, Search, Filter, Clock, Plus, MessageCircle } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons"
import Image from "next/image"

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

function StatCard({
  title,
  value,
  icon,
  bgGradient,
}: {
  title: string
  value: number | string
  icon: React.ReactNode
  bgGradient: string
}) {
  return (
    <div className={`rounded-lg p-4 shadow-sm ${bgGradient} text-white`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-semibold text-white/90">{title}</p>
          <p className="mt-3 text-3xl font-bold">{value}</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/20">
          {icon}
        </div>
      </div>
    </div>
  )
}

function MessageCard({
  message,
  locale,
  onDelete,
}: {
  message: ContactMessage
  locale: string
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [pending, startTransition] = useTransition()
  const isRTL = locale === "ar"
  const isNew = message.status === "new" || !message.status
  const [read, setRead] = useState(false)
  const [replied, setReplied] = useState(false)

  // Persist read/replied state in localStorage so we can collect stats client-side
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`contact_msg_state_${message.id}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        setRead(Boolean(parsed.read))
        setReplied(Boolean(parsed.replied))
      }
    } catch (e) {
      // ignore
    }
  }, [message.id])

  function handleDelete() {
    if (!confirm(isRTL ? "هل أنت متأكد من حذف هذه الرسالة؟" : "Delete this message?")) return
    startTransition(async () => {
      await deleteContactMessageAction(message.id, locale)
      onDelete()
    })
  }

  function playClickSound() {
    try {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
      const ctx = new Ctx()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = "sine"
      o.frequency.value = 880
      g.gain.value = 0.04
      o.connect(g)
      g.connect(ctx.destination)
      o.start()
      setTimeout(() => {
        o.stop()
        try { ctx.close() } catch {}
      }, 120)
    } catch {
      // ignore
    }
  }

  function persistState(next: { read?: boolean; replied?: boolean }) {
    try {
      const raw = localStorage.getItem(`contact_msg_state_${message.id}`)
      const current = raw ? JSON.parse(raw) : { read: false, replied: false }
      const merged = { ...current, ...next }
      localStorage.setItem(`contact_msg_state_${message.id}`, JSON.stringify(merged))
      if (typeof merged.read === "boolean") setRead(merged.read)
      if (typeof merged.replied === "boolean") setReplied(merged.replied)
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#006EA8] text-white font-semibold text-sm">
            {message.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#111827]">{message.name}</p>
            <p className="text-xs text-[#6B7280] truncate">{message.email}</p>
          </div>
          {isNew && (
            <span className="px-2 py-1 rounded-full bg-[#006EA8] text-white text-xs font-semibold flex-shrink-0">
              {isRTL ? "جديد" : "New"}
            </span>
          )}
        </div>

        {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !expanded
                setExpanded(next)
                // mark as read when opened
                if (next) persistState({ read: true })
              }}
              className="p-1.5 rounded-full hover:bg-[#F3F4F6] text-[#6B7280]"
              title={expanded ? (isRTL ? "إخفاء" : "Hide") : (isRTL ? "عرض" : "Show")}
            >
              {expanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>

            <button
              onClick={handleDelete}
              disabled={pending}
              className="p-1.5 rounded-full hover:bg-red-50 text-red-500 disabled:opacity-50"
              title={isRTL ? "حذف" : "Delete"}
            >
              <Trash2 className="h-4 w-4" />
            </button>

            {/* Share via email */}
            <button
              onClick={() => {
                const subject = encodeURIComponent(`${isRTL ? "رد على الرسالة من" : "Reply to message from"} ${message.name}`)
                const body = encodeURIComponent(`${message.message}\n\n${message.name} <${message.email}>`)
                window.open(`mailto:${message.email}?subject=${subject}&body=${body}`)
              }}
              className="p-1.5 rounded-full hover:bg-[#F3F4F6] text-[#6B7280]"
              title={isRTL ? "مشاركة عبر البريد" : "Share via Email"}
            >
              <Mail className="h-4 w-4" />
            </button>

            {/* Share via WhatsApp (opens external) */}
            <button
              onClick={() => {
                playClickSound()
                const text = encodeURIComponent(`${message.name}\n${message.message}\n${message.email}`)
                window.open(`https://wa.me/?text=${text}`)
              }}
              className="p-1.5 rounded-full hover:bg-green-50 text-[#25D366] transition-colors"
              title={isRTL ? "مشاركة عبر واتساب" : "Share via WhatsApp"}
            >
              <FontAwesomeIcon icon={faWhatsapp} style={{ width: 16, height: 16 }} aria-hidden />
            </button>

            {/* Mark replied toggle */}
            <button
              onClick={() => persistState({ replied: !replied })}
              className={"px-2 py-1 rounded-md text-sm " + (replied ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700")}
              title={isRTL ? "وضع علامة تم الرد" : "Mark as replied"}
            >
              {replied ? (isRTL ? "تم الرد" : "Replied") : (isRTL ? "لم يُرد" : "Mark replied")}
            </button>
          </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="p-4 space-y-3 bg-[#F9FAFB]">
          <div>
            <p className="text-xs font-semibold text-[#6B7280] mb-1 uppercase tracking-wide">
              {isRTL ? "الرسالة" : "Message"}
            </p>
            <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap break-words">{message.message}</p>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-[#6B7280]">
            {message.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                <span dir="ltr">{message.phone}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(message.created_at || "")}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export function AdminContactMessagesPanel({
  messages: initialMessages,
  locale,
}: {
  messages: ContactMessage[]
  locale: string
}) {
  const [messages, setMessages] = useState(initialMessages)
  const [searchQuery, setSearchQuery] = useState("")
  const isRTL = locale === "ar"

  const filteredMessages = useMemo(() => {
    if (!searchQuery) return messages

    const query = searchQuery.toLowerCase()
    return messages.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.message.toLowerCase().includes(query)
    )
  }, [messages, searchQuery])

  const stats = {
    total: messages.length,
    new: messages.filter((m) => m.status === "new" || !m.status).length,
  }

  // Count replied flags persisted in localStorage
  const repliedCount = typeof window !== "undefined"
    ? messages.reduce((acc, m) => {
        try {
          const raw = localStorage.getItem(`contact_msg_state_${m.id}`)
          if (!raw) return acc
          const parsed = JSON.parse(raw)
          return acc + (parsed.replied ? 1 : 0)
        } catch {
          return acc
        }
      }, 0)
    : 0

  function handleDelete(id: number) {
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className="space-y-4 relative">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title={isRTL ? "إجمالي الرسائل" : "Total Messages"}
          value={stats.total}
          icon={<Mail className="h-6 w-6 text-white" />}
          bgGradient="bg-gradient-to-br from-[#006EA8]/50 to-[#005685]/80"
        />
        <StatCard
          title={isRTL ? "رسائل جديدة" : "New Messages"}
          value={stats.new}
          icon={<MessageCircle className="h-6 w-6 text-white" />}
          bgGradient="bg-gradient-to-br from-[#41A0CA]/50 to-[#2AA7B9]/80"
        />
        <StatCard
          title={isRTL ? "تم الرد" : "Replied"}
          value={repliedCount}
          icon={<FontAwesomeIcon icon={faWhatsapp} style={{ width: 24, height: 24, color: 'rgba(255,255,255,0.8)' }} />}
          bgGradient="bg-gradient-to-br from-[#25D366]/90 to-[#1BA855]/80"
        />
      </div>

      {/* Search */}
      {messages.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder={isRTL ? "بحث في الرسائل..." : "Search messages..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#006EA8]"
          />
        </div>
      )}

      {/* Messages */}
      {filteredMessages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#E5E7EB] bg-[#F9FAFB] py-16 text-center">
          <Mail className="mx-auto h-12 w-12 text-[#D1D5DB] mb-3" />
          <p className="text-sm text-[#6B7280] font-medium">
            {searchQuery
              ? isRTL ? "لا توجد رسائل مطابقة" : "No matching messages"
              : isRTL ? "لا توجد رسائل" : "No messages"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMessages.map((msg) => (
            <MessageCard
              key={msg.id}
              message={msg}
              locale={locale}
              onDelete={() => handleDelete(msg.id)}
            />
          ))}
        </div>
      )}

   
    </div>
  )
}
