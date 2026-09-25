"use client";

import { useState } from "react";
import {
  ArrowUp,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Lightbulb,
  MessageCircle,
  Mic,
  Paperclip,
  Sparkles,
  Target,
  UserRound,
  X,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

const suggestions = [
  {
    icon: CalendarDays,
    title: "What's my schedule today?",
    description: "View today's classes and timings",
  },
  {
    icon: BookOpen,
    title: "Explain Software Architecture",
    description: "Get a simple course explanation",
  },
  {
    icon: Target,
    title: "How can I improve my GPA?",
    description: "Analyze your academic performance",
  },
  {
    icon: FileText,
    title: "What assignments are due?",
    description: "Find upcoming deadlines",
  },
];

const quickResponses: Record<string, string> = {
  "What's my schedule today?":
    "You have 3 classes today: Software Architecture at 9:00 AM in Lab 3, Artificial Intelligence at 11:00 AM in A-204, and Web Engineering at 1:00 PM in Lab 2.",

  "Explain Software Architecture":
    "Software Architecture is the high-level structure of a software system. It defines major components, how they communicate, and the architectural decisions that shape scalability, maintainability, security, and performance.",

  "How can I improve my GPA?":
    "Based on your current academic overview, focus first on courses where your performance is below your strongest subjects. I can also create a weekly study plan around your timetable and upcoming assignments.",

  "What assignments are due?":
    "Your nearest pending assignments are Microservices Architecture Report due on 26 Sep, Intelligent Search using A* due on 28 Sep, and Network Security Assessment due on 30 Sep.",
};

export default function AICopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: "Hi Abdullah 👋 I'm your UniSphere AI Copilot. I can help you understand your courses, track academic deadlines, plan your study time, and find information across the university portal. What would you like to do?",
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  function sendMessage(message?: string) {
    const text = (message ?? input).trim();

    if (!text || isTyping) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const knownResponse =
        quickResponses[text] ??
        "I understand. In the connected version of UniSphere, I’ll be able to search university-approved information, your academic records, timetable, assignments, resources, and other student services to give you a personalized answer.";

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: knownResponse,
        },
      ]);

      setIsTyping(false);
    }, 900);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-375">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-600">
              <Sparkles size={13} />
              AI-Powered Student Assistant
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              AI Copilot
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Your intelligent academic companion inside UniSphere.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={15} />
            </div>

            <div>
              <p className="text-[11px] font-semibold text-gray-800">
                University AI
              </p>
              <p className="text-[10px] text-gray-400">Ready to assist</p>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
          {/* Chat */}
          <Card className="flex min-h-170 flex-col overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-100">
                    <Sparkles size={19} />
                  </div>

                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-gray-950">
                    UniSphere Copilot
                  </h2>

                  <p className="text-[11px] text-emerald-600">
                    Online · University Assistant
                  </p>
                </div>
              </div>

              <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700">
                <X size={17} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-5 overflow-y-auto bg-[#fafbff] p-5 lg:p-7">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-100 text-indigo-600">
                      <Sparkles size={15} />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "rounded-br-md bg-indigo-600 text-white shadow-md shadow-indigo-100"
                        : "rounded-tl-md border border-gray-200 bg-white text-gray-700 shadow-sm"
                    }`}
                  >
                    {message.text}
                  </div>

                  {message.role === "user" && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gray-900 text-white">
                      <UserRound size={15} />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-100 text-indigo-600">
                    <Sparkles size={15} />
                  </div>

                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-gray-200 bg-white px-4 py-3">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-gray-100 bg-white p-4">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-2 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  rows={2}
                  placeholder="Ask UniSphere anything..."
                  className="w-full resize-none bg-transparent px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />

                <div className="flex items-center justify-between px-2 pb-1">
                  <div className="flex items-center gap-1">
                    <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                      <Paperclip size={16} />
                    </button>

                    <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                      <Mic size={16} />
                    </button>

                    <span className="ml-2 hidden text-[10px] text-gray-400 sm:block">
                      Enter to send · Shift + Enter for new line
                    </span>
                  </div>

                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isTyping}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowUp size={17} />
                  </button>
                </div>
              </div>

              <p className="mt-2 text-center text-[10px] text-gray-400">
                UniSphere AI can make mistakes. Verify important academic or
                administrative information.
              </p>
            </div>
          </Card>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Suggestions */}
            <Card className="p-5">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-gray-950">
                  Suggested actions
                </h2>

                <p className="mt-1 text-[11px] text-gray-400">
                  Try one of these common requests.
                </p>
              </div>

              <div className="space-y-2">
                {suggestions.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.title}
                      onClick={() => sendMessage(item.title)}
                      className="group flex w-full items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-left transition hover:border-indigo-100 hover:bg-indigo-50/60"
                    >
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-indigo-600 shadow-sm">
                        <Icon size={16} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 group-hover:text-indigo-700">
                          {item.title}
                        </p>

                        <p className="mt-0.5 text-[10px] text-gray-400">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Student context */}
            <Card className="p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-600">
                  <GraduationCap size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-gray-950">
                    Your academic context
                  </h2>

                  <p className="text-[10px] text-gray-400">
                    Information available to your assistant
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
                  <span className="text-[11px] text-gray-500">Current GPA</span>
                  <span className="text-xs font-bold text-gray-900">3.72</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
                  <span className="text-[11px] text-gray-500">Attendance</span>
                  <span className="text-xs font-bold text-emerald-600">
                    91%
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
                  <span className="text-[11px] text-gray-500">
                    Active Courses
                  </span>
                  <span className="text-xs font-bold text-gray-900">6</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
                  <span className="text-[11px] text-gray-500">
                    Pending Assignments
                  </span>
                  <span className="text-xs font-bold text-amber-600">3</span>
                </div>
              </div>
            </Card>

            {/* AI capabilities */}
            <Card className="overflow-hidden">
              <div className="bg-linear-to-br from-gray-950 to-gray-800 p-5 text-white">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <Lightbulb size={17} />
                </div>

                <h2 className="text-sm font-bold">What Copilot will do</h2>

                <p className="mt-1 text-[11px] leading-5 text-gray-300">
                  UniSphere will connect AI with your university's approved
                  information and academic services.
                </p>

                <div className="mt-5 space-y-3">
                  {[
                    ["Academic Q&A", "Answer course-related questions"],
                    ["Study Planning", "Build personalized study plans"],
                    ["Smart Search", "Find university information"],
                    ["Academic Insights", "Identify useful patterns"],
                  ].map(([title, description]) => (
                    <div key={title} className="flex gap-3">
                      <CheckCircle2
                        size={15}
                        className="mt-0.5 shrink-0 text-indigo-300"
                      />

                      <div>
                        <p className="text-xs font-semibold">{title}</p>
                        <p className="mt-0.5 text-[10px] text-gray-400">
                          {description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom info */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="flex items-center gap-4 p-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <Clock3 size={18} />
            </div>

            <div>
              <p className="text-[11px] text-gray-400">Study Planning</p>
              <p className="mt-1 text-sm font-bold text-gray-900">
                Personalized
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <MessageCircle size={18} />
            </div>

            <div>
              <p className="text-[11px] text-gray-400">University Q&A</p>
              <p className="mt-1 text-sm font-bold text-gray-900">
                24 / 7 Assistant
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <GraduationCap size={18} />
            </div>

            <div>
              <p className="text-[11px] text-gray-400">Academic Context</p>
              <p className="mt-1 text-sm font-bold text-gray-900">
                Student-aware
              </p>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
