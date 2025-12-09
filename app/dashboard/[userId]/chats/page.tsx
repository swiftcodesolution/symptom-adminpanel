// app/dashboard/[userId]/chats/page.tsx
"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Search,
  Filter,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
import { mockChats } from "@/lib/mock-data";
import { formatDateTime, getRelativeTime } from "@/lib/utils";

interface ChatsPageProps {
  params: Promise<{ userId: string }>;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function ChatsPage({ params }: ChatsPageProps) {
  const { userId } = use(params);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedChat, setExpandedChat] = useState<string | null>(null);

  const userChats = mockChats.filter((chat) => chat.userId === userId);

  const filteredChats = userChats.filter((chat) => {
    const matchesSearch = chat.topic
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || chat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: userChats.length,
    ongoing: userChats.filter((c) => c.status === "ongoing").length,
    completed: userChats.filter((c) => c.status === "completed").length,
    archived: userChats.filter((c) => c.status === "archived").length,
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Symptom Chats</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI health assistant conversations
          </p>
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
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Total Chats",
              value: stats.total,
              color: "bg-blue-500",
            },
            {
              label: "Ongoing",
              value: stats.ongoing,
              color: "bg-green-500",
            },
            {
              label: "Completed",
              value: stats.completed,
              color: "bg-gray-500",
            },
            {
              label: "Archived",
              value: stats.archived,
              color: "bg-yellow-500",
            },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${stat.color}`} />
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
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <Filter className="h-4 w-4 mr-2" />
                {statusFilter === "all"
                  ? "All Status"
                  : statusFilter.charAt(0).toUpperCase() +
                    statusFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("ongoing")}>
                Ongoing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("archived")}>
                Archived
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        {/* Chats List */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversations ({filteredChats.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredChats.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No chats found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredChats.map((chat) => (
                    <Collapsible
                      key={chat.id}
                      open={expandedChat === chat.id}
                      onOpenChange={() =>
                        setExpandedChat(
                          expandedChat === chat.id ? null : chat.id
                        )
                      }
                    >
                      <div className="border rounded-lg overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {chat.topic}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    {chat.messages.length} messages
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {getRelativeTime(chat.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  chat.status === "ongoing"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {chat.status}
                              </Badge>
                              {expandedChat === chat.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="border-t bg-muted/30 p-4 space-y-3">
                            {chat.messages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex gap-3 ${
                                  message.role === "assistant"
                                    ? "flex-row"
                                    : "flex-row-reverse"
                                }`}
                              >
                                <div
                                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                                    message.role === "assistant"
                                      ? "bg-primary/10"
                                      : "bg-muted"
                                  }`}
                                >
                                  {message.role === "assistant" ? (
                                    <MessageSquare className="h-4 w-4 text-primary" />
                                  ) : (
                                    <User className="h-4 w-4" />
                                  )}
                                </div>
                                <div
                                  className={`flex-1 p-3 rounded-lg text-sm ${
                                    message.role === "assistant"
                                      ? "bg-primary/5 border"
                                      : "bg-muted"
                                  }`}
                                >
                                  <p>{message.content}</p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {formatDateTime(message.timestamp)}
                                  </p>
                                </div>
                              </div>
                            ))}
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
    </div>
  );
}
