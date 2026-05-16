import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageCircle,
  Phone,
  Heart,
  AtSign,
  Search,
  Filter,
  Clock,
  Trash2,
  CheckCheck,
  Loader,
} from 'lucide-react'
import { ChatAvatar } from '@/chat/components/chat-avatar'
import { Button } from '@/components/ui/button'
import { UserLayout } from '../components/user-layout'
import { MENTIONS_ALL, MENTIONS_UNREAD } from '@/config/api'
import { apiClient } from '@/lib/client'

const ACTIVITY_TYPES = {
  MENTION: 'mention',
  REACTION: 'reaction',
  CALL: 'call',
  MESSAGE: 'message',
}

// Helper to transform API mention data to activity format
const transformMentionToActivity = (mention) => {
  const createdDate = new Date(mention.createdAt || mention.created_at || Date.now())
  
  const senderName = mention.sender_name || 
                     mention.mentionedBy?.name || 
                     mention.mentioned_by?.name || 
                     'Unknown User'
  
  return {
    id: mention.id || mention._id || mention.mention_id,
    type: ACTIVITY_TYPES.MENTION,
    user: {
      name: senderName,
      initials: senderName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase(),
      avatar: mention.mentionedBy?.avatar || mention.mentioned_by?.avatar || null,
      userId: mention.mentionedBy?.id || mention.mentioned_by?.id || mention.userId,
    },
    action: mention.type === 'everyone' ? 'mentioned everyone' : 'mentioned you',
    content: mention.messageContent || mention.message_content || mention.content,
    context: mention.channelName || mention.channel_name || 'Chat',
    contextId: mention.channelId || mention.channel_id || mention.chatId || 'unknown',
    contextType: mention.contextType || mention.context_type || 'channel',
    timestamp: createdDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }),
    date: createdDate,
    icon: 'mention',
    read: mention.read || mention.isRead || mention.is_read || false,
  }
}

const ActivityItem = ({
  activity,
  onNavigate,
  onMarkRead,
  onDelete,
}) => {
  const getIcon = (iconType) => {
    const iconConfig = {
      mention: { icon: AtSign, color: 'text-brand-tertiary' },
      reaction: { icon: Heart, color: 'text-brand-tertiary' },
      call: { icon: Phone, color: 'text-brand-tertiary' },
      message: { icon: MessageCircle, color: 'text-brand-tertiary' },
    }

    const config = iconConfig[iconType] || iconConfig.message
    const IconComponent = config.icon

    return <IconComponent className={`size-4 ${config.color}`} />
  }

  return (
    <div
      className={`group flex items-start gap-4 border-l-4 border rounded-2xl px-6 py-4 transition ${
        activity.read
          ? 'border-l-brand-line border-brand-line bg-white hover:bg-brand-soft'
          : 'border-l-brand-primary border-gray bg-brand-neutral hover:bg-brand-neutral/80'
      }`}
    >
      
      <div className="relative shrink-0 cursor-pointer" onClick={() => onNavigate?.(activity)}>
        {activity.user.avatar ? (
          <img
            src={activity.user.avatar}
            alt={activity.user.name}
            className="size-12 rounded-full object-cover ring-2 ring-brand-soft"
          />
        ) : (
          <ChatAvatar name={activity.user.name} size="size-12" />
        )}
        <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1.5 shadow-md ring-1 ring-brand-line">
          {getIcon(activity.icon)}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onNavigate?.(activity)}>
            {/* Main title */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-brand-ink">
                {activity.user.name}
              </span>
              <span className="text-brand-secondary">
                {activity.action}
              </span>
            </div>

            {activity.reaction && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-yellow-100/50 px-3 py-1 ring-1 ring-yellow-200">
                <span className="text-lg">{activity.reaction}</span>
              </div>
            )}

            {activity.content && (
              <p className="mt-2 text-sm text-brand-secondary line-clamp-2">
                {activity.content}
              </p>
            )}

            {activity.context && (
              <p className="mt-1.5 text-xs font-medium text-brand-secondary">
                {activity.context}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-start gap-2">
            <span className="text-sm font-medium text-brand-secondary whitespace-nowrap">
              {activity.timestamp}
            </span>

            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {!activity.read && (
                <button
                  type="button"
                  onClick={() => onMarkRead?.(activity.id)}
                  className="rounded-md p-1.5 text-brand-secondary transition hover:bg-brand-primary hover:text-white"
                  title="Mark as read"
                >
                  <CheckCheck className="size-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onDelete?.(activity.id)}
                className="rounded-md p-1.5 text-brand-secondary transition hover:bg-brand-tertiary hover:text-white"
                title="Delete activity"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const ActivityPage = () => {
  const navigate = useNavigate()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)

  // Fetch mentions from API
  useEffect(() => {
    const fetchMentions = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiClient.get(MENTIONS_ALL)
        
        if (response.data && Array.isArray(response.data)) {
          const transformedActivities = response.data.map((mention) =>
            transformMentionToActivity(mention)
          )
          setActivities(transformedActivities)
        } else if (response.data) {
          // Handle case where data is wrapped in an object
          const mentions = response.data.data || response.data.mentions || []
          const transformedActivities = Array.isArray(mentions) 
            ? mentions.map((mention) => transformMentionToActivity(mention))
            : []
          setActivities(transformedActivities)
        }
      } catch (err) {
        console.error('Failed to fetch mentions:', err)
        setError('Failed to load activities. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchMentions()
  }, [])

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      
      if (selectedFilter !== 'all' && activity.type !== selectedFilter) {
        return false
      }

      if (showOnlyUnread && activity.read) {
        return false
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        return (
          activity.user.name.toLowerCase().includes(query) ||
          activity.context?.toLowerCase().includes(query) ||
          activity.content?.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [activities, searchQuery, selectedFilter, showOnlyUnread])

  const groupedActivities = useMemo(() => {
    const groups = {}

    filteredActivities.forEach((activity) => {
      const dateKey = activity.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(activity)
    })

    return groups
  }, [filteredActivities])

  const handleNavigate = useCallback(
    (activity) => {
      
      if (!activity.read) {
        handleMarkRead(activity.id)
      }

      if (activity.contextType === 'chat') {
        navigate(`/chat/${activity.contextId}`)
      } else if (activity.contextType === 'channel') {
        navigate(`/channels/${activity.contextId}`)
      } else if (activity.contextType === 'group') {
        navigate(`/chat/${activity.contextId}`)
      }
    },
    [navigate]
  )

  const handleMarkRead = useCallback(async (id) => {
    try {
      // Update local state optimistically
      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === id ? { ...activity, read: true } : activity
        )
      )
      
      // Call API to mark as read (adjust endpoint as per your backend)
      await apiClient.post(`${MENTIONS_ALL}/${id}/mark-read`, {})
    } catch (err) {
      console.error('Failed to mark as read:', err)
      // Revert on error
      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === id ? { ...activity, read: false } : activity
        )
      )
    }
  }, [])

  const handleDelete = useCallback(async (id) => {
    try {
      // Update local state optimistically
      setActivities((prev) => prev.filter((activity) => activity.id !== id))
      
      // Call API to delete (adjust endpoint as per your backend)
      await apiClient.delete(`${MENTIONS_ALL}/${id}`)
    } catch (err) {
      console.error('Failed to delete mention:', err)
      // Revert on error by refetching
      try {
        const response = await apiClient.get(MENTIONS_ALL)
        if (response.data && Array.isArray(response.data)) {
          const transformedActivities = response.data.map((mention) =>
            transformMentionToActivity(mention)
          )
          setActivities(transformedActivities)
        } else if (response.data) {
          const mentions = response.data.data || response.data.mentions || []
          const transformedActivities = Array.isArray(mentions) 
            ? mentions.map((mention) => transformMentionToActivity(mention))
            : []
          setActivities(transformedActivities)
        }
      } catch (refetchErr) {
        console.error('Failed to refetch mentions:', refetchErr)
        setError('Failed to delete activity. Please try again.')
      }
    }
  }, [])

  const handleClearAll = useCallback(async () => {
    try {
      // Update local state optimistically
      setActivities([])
      
      // Call API to clear all (adjust endpoint as per your backend)
      await apiClient.delete(`${MENTIONS_ALL}/clear-all`)
    } catch (err) {
      console.error('Failed to clear all mentions:', err)
      setError('Failed to clear all activities. Please try again.')
      // Refetch on error
      try {
        const response = await apiClient.get(MENTIONS_ALL)
        if (response.data && Array.isArray(response.data)) {
          const transformedActivities = response.data.map((mention) =>
            transformMentionToActivity(mention)
          )
          setActivities(transformedActivities)
        } else if (response.data) {
          const mentions = response.data.data || response.data.mentions || []
          const transformedActivities = Array.isArray(mentions) 
            ? mentions.map((mention) => transformMentionToActivity(mention))
            : []
          setActivities(transformedActivities)
        }
      } catch (refetchErr) {
        console.error('Failed to refetch mentions:', refetchErr)
      }
    }
  }, [])

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      // Update local state optimistically
      setActivities((prev) => prev.map((activity) => ({ ...activity, read: true })))
      
      // Call API to mark all as read (adjust endpoint as per your backend)
      await apiClient.post(`${MENTIONS_ALL}/mark-all-read`, {})
    } catch (err) {
      console.error('Failed to mark all as read:', err)
      setError('Failed to mark all as read. Please try again.')
      // Refetch on error
      try {
        const response = await apiClient.get(MENTIONS_ALL)
        if (response.data && Array.isArray(response.data)) {
          const transformedActivities = response.data.map((mention) =>
            transformMentionToActivity(mention)
          )
          setActivities(transformedActivities)
        } else if (response.data) {
          const mentions = response.data.data || response.data.mentions || []
          const transformedActivities = Array.isArray(mentions) 
            ? mentions.map((mention) => transformMentionToActivity(mention))
            : []
          setActivities(transformedActivities)
        }
      } catch (refetchErr) {
        console.error('Failed to refetch mentions:', refetchErr)
      }
    }
  }, [])

  const unreadCount = activities.filter((a) => !a.read).length

  return (
    <UserLayout>
      <div className="flex h-full min-h-0 flex-col ">
        {/* Header */}
        <div className="  px-8 py-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-brand-ink">Activity</h1>
              <p className="mt-1 text-sm text-brand-secondary">
                Stay updated on mentions, reactions, and important events
              </p>
            </div>
            {activities.length > 0 && (
              <div className="flex gap-3">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="border-brand-primary text-brand-primary border rounded-lg hover:bg-brand-primary hover:text-primary/90"
                  >
                    <CheckCheck className="mr-2 size-4" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="border-brand-tertiary text-brand-tertiary border rounded-lg hover:bg-brand-tertiary hover:text-red-600/90"
                >
                  <Trash2 className="mr-2 size-4" />
                  Clear all
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 size-5 text-brand-secondary" />
              <input
                type="text"
                placeholder="Search by name, channel, or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-brand-line bg-white py-2 pl-10 pr-4 text-sm text-brand-ink placeholder-brand-secondary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-3 size-5 text-brand-secondary" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="rounded-lg border border-brand-line bg-white py-2 pl-10 pr-4 text-sm text-brand-ink focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                >
                  <option value="all">All types</option>
                  <option value={ACTIVITY_TYPES.MENTION}>Mentions</option>
                  <option value={ACTIVITY_TYPES.REACTION}>Reactions</option>
                  <option value={ACTIVITY_TYPES.CALL}>Calls</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowOnlyUnread(!showOnlyUnread)}
                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition ${
                  showOnlyUnread
                    ? 'border-brand-primary bg-brand-primary text-white'
                    : 'border-brand-line bg-white text-brand-ink hover:border-brand-primary'
                }`}
              >
                <Clock className="mr-2 inline size-4" />
                Unread
              </button>
            </div>
          </div>

          {/* Stats */}
          {activities.length > 0 && (
            <div className="mt-4 flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-brand-primary"></div>
                <span className="text-brand-secondary">
                  {unreadCount} <span className="font-medium">Unread</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-brand-line"></div>
                <span className="text-brand-secondary">
                  {activities.length - unreadCount} <span className="font-medium">Read</span>
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center p-8">
              <Loader className="size-12 animate-spin text-brand-primary" />
              <p className="mt-4 text-brand-secondary">Loading activities...</p>
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 rounded-3xl bg-red-50 p-4">
                <MessageCircle className="size-12 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-brand-ink">{error}</h3>
              <Button
                onClick={() => {
                  setLoading(true)
                  setError(null)
                  // Retry fetching
                  apiClient.get(MENTIONS_ALL)
                    .then((response) => {
                      if (response.data && Array.isArray(response.data)) {
                        const transformedActivities = response.data.map((mention) =>
                          transformMentionToActivity(mention)
                        )
                        setActivities(transformedActivities)
                      } else if (response.data) {
                        const mentions = response.data.data || response.data.mentions || []
                        const transformedActivities = Array.isArray(mentions) 
                          ? mentions.map((mention) => transformMentionToActivity(mention))
                          : []
                        setActivities(transformedActivities)
                      }
                    })
                    .catch((err) => {
                      console.error('Failed to fetch mentions:', err)
                      setError('Failed to load activities. Please try again.')
                    })
                    .finally(() => setLoading(false))
                }}
                className="mt-4 bg-brand-primary text-white hover:bg-brand-primary/90"
              >
                Retry
              </Button>
            </div>
          ) : filteredActivities.length > 0 ? (
            <div className="divide-y divide-brand-line">
              {Object.entries(groupedActivities).map(([dateKey, items]) => (
                <div key={dateKey}>
                  
                  <div className="sticky top-0 flex items-center gap-4  px-8 py-3 z-10">
                    <div className="h-px flex-1 bg-brand-line"></div>
                    <span className="text-sm font-semibold text-brand-secondary">{dateKey}</span>
                    <div className="h-px flex-1 bg-brand-line"></div>
                  </div>

                  {items.map((activity) => (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                      onNavigate={handleNavigate}
                      onMarkRead={handleMarkRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 rounded-3xl bg-brand-soft p-4">
                <MessageCircle className="size-12 text-brand-primary" />
              </div>
              <h3 className="text-lg font-semibold text-brand-ink">No activities yet</h3>
              <p className="mt-2 max-w-sm text-sm text-brand-secondary">
                {searchQuery || selectedFilter !== 'all' || showOnlyUnread
                  ? 'No activities match your filters. Try adjusting your search criteria.'
                  : 'When you receive mentions, reactions, or messages, they\'ll appear here.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  )
}
