// app/dashboard/[userId]/chats/page.tsx
"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Search,
  Filter,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Bot,
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Sparkles,
  FileText,
  Copy,
  Check,
  Mic,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { formatDateTime, getRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

interface ChatsPageProps {
  params: Promise<{ userId: string }>;
}

// Raw message from API
interface ChatMessage {
  id: string;
  sessionId: string;
  message: string;
  isUser: boolean;
  userId: string;
  timestamp: { _seconds: number; _nanoseconds: number };
  isFromVoice: boolean;
  isError: boolean;
}

// Grouped chat session
interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  firstMessage: ChatMessage;
  lastMessage: ChatMessage;
  topic: string;
  messageCount: number;
  userMessageCount: number;
  aiMessageCount: number;
  hasVoiceMessages: boolean;
  hasErrors: boolean;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
}

interface UserProfile {
  displayName: string;
}

interface UserData {
  profile: UserProfile;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Helper to convert Firestore timestamp to Date
function firestoreTimestampToDate(timestamp: {
  _seconds: number;
  _nanoseconds: number;
}): Date {
  return new Date(timestamp._seconds * 1000);
}

// Helper to extract topic from first AI message or user message
function extractTopic(messages: ChatMessage[]): string {
  // Find first user message to use as topic
  const firstUserMessage = messages.find((m) => m.isUser);
  if (firstUserMessage) {
    const text = firstUserMessage.message;
    // Truncate and clean up
    if (text.length > 50) {
      return text.substring(0, 50) + "...";
    }
    return text;
  }

  // Fallback to first AI message
  const firstAiMessage = messages.find((m) => !m.isUser);
  if (firstAiMessage) {
    return "Health Consultation";
  }

  return "Chat Session";
}

// Group messages by sessionId
function groupMessagesBySessions(messages: ChatMessage[]): ChatSession[] {
  const sessionMap = new Map<string, ChatMessage[]>();

  // Group messages by sessionId
  messages.forEach((msg) => {
    const existing = sessionMap.get(msg.sessionId) || [];
    existing.push(msg);
    sessionMap.set(msg.sessionId, existing);
  });

  // Convert to ChatSession array
  const sessions: ChatSession[] = [];

  sessionMap.forEach((msgs, sessionId) => {
    // Sort messages by timestamp
    const sortedMessages = msgs.sort(
      (a, b) => a.timestamp._seconds - b.timestamp._seconds
    );

    const firstMessage = sortedMessages[0];
    const lastMessage = sortedMessages[sortedMessages.length - 1];
    const startTime = firestoreTimestampToDate(firstMessage.timestamp);
    const endTime = firestoreTimestampToDate(lastMessage.timestamp);

    sessions.push({
      sessionId,
      messages: sortedMessages,
      firstMessage,
      lastMessage,
      topic: extractTopic(sortedMessages),
      messageCount: sortedMessages.length,
      userMessageCount: sortedMessages.filter((m) => m.isUser).length,
      aiMessageCount: sortedMessages.filter((m) => !m.isUser).length,
      hasVoiceMessages: sortedMessages.some((m) => m.isFromVoice),
      hasErrors: sortedMessages.some((m) => m.isError),
      startTime,
      endTime,
      duration: Math.round((endTime.getTime() - startTime.getTime()) / 60000),
    });
  });

  // Sort sessions by start time (newest first)
  return sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Separator />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-96 rounded-lg" />
    </div>
  );
}

export default function ChatsPage({ params }: ChatsPageProps) {
  const { userId } = use(params);
  const authFetch = useAuthFetch();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [expandedChat, setExpandedChat] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(
    null
  );
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch user profile and chats in parallel
        const [userResponse, chatsResponse] = await Promise.all([
          authFetch(`/panel/api/admin/users/${userId}`),
          authFetch(`/panel/api/admin/users/${userId}/chats`),
        ]);

        if (!userResponse.ok) {
          if (userResponse.status === 404) {
            setError("User not found");
          } else {
            setError("Failed to fetch user data");
          }
          return;
        }

        const userData = await userResponse.json();
        setUserData(userData);

        if (chatsResponse.ok) {
          const chatsData = await chatsResponse.json();
          setChatMessages(chatsData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId, authFetch]);

  // Group messages into sessions
  const sessions = useMemo(() => {
    return groupMessagesBySessions(chatMessages);
  }, [chatMessages]);

  // Filter sessions based on search
  const filteredSessions = useMemo(() => {
    if (!searchQuery) return sessions;

    return sessions.filter((session) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        session.topic.toLowerCase().includes(searchLower) ||
        session.messages.some((m) =>
          m.message.toLowerCase().includes(searchLower)
        )
      );
    });
  }, [sessions, searchQuery]);

  // Sort sessions
  const sortedSessions = useMemo(() => {
    return [...filteredSessions].sort((a, b) => {
      if (sortOrder === "newest") {
        return b.startTime.getTime() - a.startTime.getTime();
      }
      return a.startTime.getTime() - b.startTime.getTime();
    });
  }, [filteredSessions, sortOrder]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);

      // Success toast
      toast.success("Message copied successfully");

      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);

      // Error toast
      toast.error("Could not copy to clipboard");
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !userData) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">{error || "User not found"}</h1>
          <p className="text-muted-foreground mt-2">
            Unable to load chat data.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { profile } = userData;

  // Calculate stats
  const stats = {
    totalSessions: sessions.length,
    totalMessages: chatMessages.length,
    userMessages: chatMessages.filter((m) => m.isUser).length,
    aiMessages: chatMessages.filter((m) => !m.isUser).length,
    voiceMessages: chatMessages.filter((m) => m.isFromVoice).length,
    avgMessagesPerSession:
      sessions.length > 0
        ? Math.round(chatMessages.length / sessions.length)
        : 0,
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link
            href="/dashboard"
            className="hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <span>/</span>
          <Link
            href={`/dashboard/${userId}`}
            className="hover:text-foreground transition-colors"
          >
            {profile.displayName}
          </Link>
          <span>/</span>
          <span className="text-foreground">Chats</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <MessageSquare className="h-7 w-7 text-green-500" />
              Symptom Chats
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI health assistant conversations for {profile.displayName}
            </p>
          </div>
          {stats.voiceMessages > 0 && (
            <Badge variant="outline" className="h-8 px-4">
              <Mic className="h-3 w-3 mr-2" />
              {stats.voiceMessages} voice message
              {stats.voiceMessages > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <Separator />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Stats */}
        <motion.div
          variants={item}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {[
            {
              label: "Chat Sessions",
              value: stats.totalSessions,
              icon: MessageSquare,
              color: "text-blue-600 dark:text-blue-400",
              bgColor: "bg-blue-500/10",
            },
            {
              label: "Total Messages",
              value: stats.totalMessages,
              icon: FileText,
              color: "text-purple-600 dark:text-purple-400",
              bgColor: "bg-purple-500/10",
            },
            {
              label: "User Messages",
              value: stats.userMessages,
              icon: User,
              color: "text-green-600 dark:text-green-400",
              bgColor: "bg-green-500/10",
            },
            {
              label: "AI Responses",
              value: stats.aiMessages,
              icon: Bot,
              color: "text-orange-600 dark:text-orange-400",
              bgColor: "bg-orange-500/10",
            },
            {
              label: "Voice Messages",
              value: stats.voiceMessages,
              icon: Mic,
              color: "text-pink-600 dark:text-pink-400",
              bgColor: "bg-pink-500/10",
            },
            {
              label: "Avg. per Session",
              value: stats.avgMessagesPerSession,
              icon: Sparkles,
              color: "text-yellow-600 dark:text-yellow-400",
              bgColor: "bg-yellow-500/10",
            },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}
                  >
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats by topic or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <Filter className="h-4 w-4 mr-2" />
                {sortOrder === "newest" ? "Newest First" : "Oldest First"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                <Clock className="h-4 w-4 mr-2" />
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                <Clock className="h-4 w-4 mr-2 rotate-180" />
                Oldest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        {/* Chat Sessions List */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat Sessions ({sortedSessions.length})
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-10 w-10 opacity-50" />
                  </div>
                  <p className="font-medium text-lg">No chats yet</p>
                  <p className="text-sm mt-1">
                    This user hasn&apos;t started any symptom checker
                    conversations.
                  </p>
                </div>
              ) : sortedSessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No matching chats</p>
                  <p className="text-sm mt-1">
                    Try adjusting your search criteria.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedSessions.map((session) => (
                    <Collapsible
                      key={session.sessionId}
                      open={expandedChat === session.sessionId}
                      onOpenChange={() =>
                        setExpandedChat(
                          expandedChat === session.sessionId
                            ? null
                            : session.sessionId
                        )
                      }
                    >
                      <div className="border rounded-lg overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium text-sm truncate">
                                    {session.topic}
                                  </p>
                                  {session.hasVoiceMessages && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs shrink-0"
                                    >
                                      <Mic className="h-3 w-3 mr-1" />
                                      Voice
                                    </Badge>
                                  )}
                                  {session.hasErrors && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs shrink-0"
                                    >
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Error
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    {session.messageCount} messages
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {session.duration > 0
                                      ? `${session.duration} min`
                                      : "< 1 min"}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {getRelativeTime(
                                      session.startTime.toISOString()
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-4">
                              <div className="text-right hidden sm:block">
                                <p className="text-xs text-muted-foreground">
                                  {session.userMessageCount} user /{" "}
                                  {session.aiMessageCount} AI
                                </p>
                              </div>
                              {expandedChat === session.sessionId ? (
                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="border-t">
                            {/* Session Info */}
                            <div className="p-3 bg-muted/30 border-b flex items-center justify-between flex-wrap gap-2">
                              <div className="text-xs text-muted-foreground">
                                <span className="font-medium">Session ID:</span>{" "}
                                <span className="font-mono">
                                  {session.sessionId}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDateTime(
                                  session.startTime.toISOString()
                                )}{" "}
                                →{" "}
                                {formatDateTime(session.endTime.toISOString())}
                              </div>
                            </div>

                            {/* Messages */}
                            <div className="p-4 space-y-4 max-h-100 overflow-y-auto">
                              {session.messages.map((message) => (
                                <div
                                  key={message.id}
                                  className={`flex gap-3 ${
                                    !message.isUser
                                      ? "flex-row"
                                      : "flex-row-reverse"
                                  }`}
                                >
                                  <div
                                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                                      !message.isUser
                                        ? "bg-primary/10"
                                        : "bg-muted"
                                    }`}
                                  >
                                    {!message.isUser ? (
                                      <Bot className="h-4 w-4 text-primary" />
                                    ) : (
                                      <User className="h-4 w-4" />
                                    )}
                                  </div>
                                  <div
                                    className={`group flex-1 max-w-[80%] ${
                                      message.isUser
                                        ? "flex flex-col items-end"
                                        : ""
                                    }`}
                                  >
                                    <div
                                      className={`p-3 rounded-lg text-sm ${
                                        !message.isUser
                                          ? "bg-primary/5 border"
                                          : "bg-muted"
                                      } ${
                                        message.isError
                                          ? "border-red-500/50 bg-red-500/5"
                                          : ""
                                      }`}
                                    >
                                      <p className="whitespace-pre-wrap">
                                        {message.message}
                                      </p>
                                      {message.isFromVoice && (
                                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                          <Mic className="h-3 w-3" />
                                          <span>Voice message</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <p className="text-xs text-muted-foreground">
                                        {formatDateTime(
                                          firestoreTimestampToDate(
                                            message.timestamp
                                          ).toISOString()
                                        )}
                                      </p>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() =>
                                          copyToClipboard(message.message)
                                        }
                                      >
                                        {copiedText === message.message ? (
                                          <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Session Footer */}
                            <div className="p-3 border-t bg-muted/30 flex items-center justify-between">
                              <div className="text-xs text-muted-foreground">
                                Duration: {session.duration} minute
                                {session.duration !== 1 ? "s" : ""}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedSession(session)}
                              >
                                View Full Chat
                              </Button>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Full Chat Dialog */}
      <Dialog
        open={!!selectedSession}
        onOpenChange={() => setSelectedSession(null)}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedSession?.topic}
            </DialogTitle>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              <span>
                {selectedSession?.messageCount} messages •{" "}
                {selectedSession?.duration} min
              </span>
              <span>
                {selectedSession &&
                  formatDateTime(selectedSession.startTime.toISOString())}
              </span>
            </div>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 py-4">
              {selectedSession?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    !message.isUser ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                      !message.isUser ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    {!message.isUser ? (
                      <Bot className="h-5 w-5 text-primary" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div
                    className={`flex-1 max-w-[85%] ${
                      message.isUser ? "flex flex-col items-end" : ""
                    }`}
                  >
                    <div
                      className={`p-4 rounded-lg ${
                        !message.isUser ? "bg-primary/5 border" : "bg-muted"
                      } ${
                        message.isError ? "border-red-500/50 bg-red-500/5" : ""
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.message}
                      </p>
                      {message.isFromVoice && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Mic className="h-3 w-3" />
                          <span>Voice message</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(
                        firestoreTimestampToDate(
                          message.timestamp
                        ).toISOString()
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
