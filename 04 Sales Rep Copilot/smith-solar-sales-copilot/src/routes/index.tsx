import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { sendToCopilot, type ToolCall } from "@/lib/copilot.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sales Copilot — Chat" },
      { name: "description", content: "Chat with your Sales Copilot and see which tools it used." },
      { property: "og:title", content: "Sales Copilot — Chat" },
      { property: "og:description", content: "Chat with your Sales Copilot and see which tools it used." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: App,
});

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "thinking" | "error" | "done";
  toolCalls?: ToolCall[];
  retryText?: string;
};
type Chat = {
  id: string;
  sessionId: string;
  title: string;
  messages: Msg[];
  createdAt: string;
  unread?: boolean;
};

const uuid = () => crypto.randomUUID();
const STORAGE_KEY = "smith-solar-sales-copilot-chats";
const ACTIVE_CHAT_KEY = "smith-solar-sales-copilot-active-chat";

const newChat = (): Chat => {
  const id = uuid();
  return { id, sessionId: id, title: "New Chat", messages: [], createdAt: new Date().toISOString() };
};

const isMessage = (value: unknown): value is Msg => {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<Msg>;
  return typeof message.id === "string" &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string";
};

const isChat = (value: unknown): value is Chat => {
  if (!value || typeof value !== "object") return false;
  const chat = value as Partial<Chat>;
  return typeof chat.id === "string" &&
    typeof chat.sessionId === "string" &&
    typeof chat.title === "string" &&
    typeof chat.createdAt === "string" &&
    Array.isArray(chat.messages) &&
    chat.messages.every(isMessage);
};

function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [input, setInput] = useState("");
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeIdRef = useRef("");

  useEffect(() => {
    try {
      const savedChats = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      const restoredChats = Array.isArray(savedChats) ? savedChats.filter(isChat) : [];
      const firstRestoredChat = restoredChats[0];
      if (firstRestoredChat) {
        const savedActiveId = localStorage.getItem(ACTIVE_CHAT_KEY);
        const restoredActiveId = restoredChats.some((chat) => chat.id === savedActiveId)
          ? savedActiveId ?? firstRestoredChat.id
          : firstRestoredChat.id;
        setChats(restoredChats);
        setActiveId(restoredActiveId);
        activeIdRef.current = restoredActiveId;
      } else {
        const chat = newChat();
        setChats([chat]);
        setActiveId(chat.id);
        activeIdRef.current = chat.id;
      }
    } catch {
      const chat = newChat();
      setChats([chat]);
      setActiveId(chat.id);
      activeIdRef.current = chat.id;
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    if (activeId) localStorage.setItem(ACTIVE_CHAT_KEY, activeId);
  }, [activeId, chats, hydrated]);

  const active = chats.find((c) => c.sessionId === activeId);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages]);

  const updateChat = (id: string, fn: (c: Chat) => Chat) =>
    setChats((cs) => cs.map((c) => (c.sessionId === id ? fn(c) : c)));

  const addChat = () => {
    const c = newChat();
    setChats((cs) => [...cs, c]);
    setActiveId(c.id);
    activeIdRef.current = c.id;
    setEditing(false);
  };

  const ask = async (sessionId: string, text: string, placeholderId: string) => {
    setBusy((b) => ({ ...b, [sessionId]: true }));
    try {
      const r = await sendToCopilot({ data: { sessionId, message: text } });
      updateChat(sessionId, (c) => ({
        ...c,
        unread: activeIdRef.current !== sessionId,
        messages: c.messages.map((m) =>
          m.id === placeholderId ? { ...m, content: r.reply, toolCalls: r.toolCalls, status: "done" } : m,
        ),
      }));
    } catch {
      updateChat(sessionId, (c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === placeholderId
            ? { ...m, content: "Something went wrong. Please try again.", status: "error", retryText: text }
            : m,
        ),
      }));
    } finally {
      setBusy((b) => ({ ...b, [sessionId]: false }));
    }
  };

  const send = () => {
    const text = input.trim();
    if (!text || !active || busy[active.sessionId]) return;
    const pid = uuid();
    updateChat(active.sessionId, (c) => ({
      ...c,
      messages: [
        ...c.messages,
        { id: uuid(), role: "user", content: text },
        { id: pid, role: "assistant", content: "", status: "thinking" },
      ],
    }));
    setInput("");
    ask(active.sessionId, text, pid);
  };

  const retry = (m: Msg) => {
    if (!active || !m.retryText) return;
    updateChat(active.sessionId, (c) => ({
      ...c,
      messages: c.messages.map((x) => (x.id === m.id ? { ...x, status: "thinking", content: "" } : x)),
    }));
    ask(active.sessionId, m.retryText, m.id);
  };

  const isBusy = active ? !!busy[active.sessionId] : false;

  useEffect(() => {
    if (!menuFor) return;
    const close = () => setMenuFor(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuFor]);

  const commitRename = (id: string) => {
    const t = renameDraft.trim() || "New Chat";
    updateChat(id, (c) => ({ ...c, title: t }));
    setRenamingId(null);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setChats((cs) => {
      const remaining = cs.filter((c) => c.id !== deleteId);
      const next = remaining.length > 0 ? remaining : [newChat()];
      if (activeIdRef.current === deleteId || !next.some((c) => c.id === activeIdRef.current)) {
        const nextId = next[0]!.id;
        setActiveId(nextId);
        activeIdRef.current = nextId;
      }
      return next;
    });
    setDeleteId(null);
    setMenuFor(null);
    setRenamingId(null);
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center border-b bg-card px-5">
        <span className="text-lg font-bold text-brand">Smith Solar</span>
        <span className="ml-2 text-lg font-medium text-brand-ink">Sales Copilot</span>
      </header>

      <div className="flex min-h-0 flex-1">
      <aside className="flex w-64 shrink-0 flex-col border-r bg-sidebar">
        <div className="p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Chats</h2>
          <button
            onClick={addChat}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            + New Chat
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {chats.map((c, index) => (
            <div
              key={c.id}
              className={`group relative mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                c.id === activeId ? "bg-sidebar-accent font-medium" : "hover:bg-accent"
              }`}
            >
              {renamingId === c.id ? (
                <input
                  autoFocus
                  value={renameDraft}
                  onChange={(e) => setRenameDraft(e.target.value)}
                  onBlur={() => commitRename(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename(c.id);
                    else if (e.key === "Escape") setRenamingId(null);
                  }}
                  className="min-w-0 flex-1 rounded-md border bg-background px-1.5 py-0.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              ) : (
                <button
                  onClick={() => {
                    setActiveId(c.id);
                    activeIdRef.current = c.id;
                    updateChat(c.id, (chat) => ({ ...chat, unread: false }));
                    setEditing(false);
                  }}
                  className="min-w-0 flex-1 truncate text-left"
                >
                  Chat {index + 1}
                  {c.title !== "New Chat" && <span className="text-muted-foreground"> · {c.title}</span>}
                </button>
              )}
              {c.unread && <span className="size-2 shrink-0 rounded-full bg-brand" aria-label="New message" />}
              {renamingId !== c.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuFor(menuFor === c.id ? null : c.id);
                  }}
                  aria-label="Chat options"
                  className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 hover:text-foreground group-hover:opacity-100"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>
              )}
              {menuFor === c.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-2 top-full z-20 mt-1 w-32 overflow-hidden rounded-lg border bg-popover py-1 text-popover-foreground shadow-md"
                >
                  <button
                    onClick={() => {
                      setRenameDraft(c.title);
                      setRenamingId(c.id);
                      setMenuFor(null);
                    }}
                    className="block w-full px-3 py-1.5 text-left text-sm hover:bg-accent"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      setDeleteId(c.id);
                      setMenuFor(null);
                    }}
                    className="block w-full px-3 py-1.5 text-left text-sm text-destructive hover:bg-accent"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="border-b px-6 py-3">
          {active &&
            (editing ? (
              <input
                autoFocus
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onBlur={() => setEditing(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const t = draftTitle.trim() || "New Chat";
                    updateChat(active.sessionId, (c) => ({ ...c, title: t }));
                    setEditing(false);
                  } else if (e.key === "Escape") setEditing(false);
                }}
                className="w-full max-w-md rounded-md border bg-background px-2 py-1 text-lg font-semibold outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <h1
                onClick={() => {
                  setDraftTitle(active.title);
                  setEditing(true);
                }}
                title="Click to rename"
                className="cursor-text rounded-md px-2 py-1 text-lg font-semibold hover:bg-accent"
              >
                {active.title}
              </h1>
            ))}
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-4 px-6 py-6">
            {active?.messages.length === 0 && (
              <p className="pt-24 text-center text-muted-foreground">Ask your Sales Copilot anything.</p>
            )}
            {active?.messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                   <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl border bg-bubble px-4 py-2 text-foreground shadow-sm">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex justify-start">
                  <div className="max-w-[85%]">
                     <div className="rounded-2xl border bg-bubble px-4 py-3 shadow-sm">
                      {m.status === "thinking" ? (
                        <span className="animate-pulse text-muted-foreground">Thinking...</span>
                      ) : m.status === "error" ? (
                        <div className="flex items-center gap-3 text-destructive">
                          <span>{m.content}</span>
                          <button
                            onClick={() => retry(m)}
                            disabled={isBusy}
                            className="rounded-md border border-destructive px-2 py-0.5 text-sm hover:bg-background disabled:opacity-50"
                          >
                            Retry
                          </button>
                        </div>
                      ) : (
                        <div className="prose-chat">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: (p) => <a {...p} target="_blank" rel="noopener noreferrer" />,
                            }}
                          >
                            {m.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    {m.toolCalls && m.toolCalls.length > 0 && (
                      <div className="mt-1 px-2 text-xs text-muted-foreground">
                        Tools:{" "}
                        {m.toolCalls.map((t, i) => (
                          <span key={i} className="mr-2">
                            {t.tool} {t.ok ? "✅" : "❌"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="border-t p-4">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder="Message Sales Copilot... (Shift+Enter for new line)"
              className="max-h-48 flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={send}
              disabled={isBusy || !input.trim()}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </main>
      </div>

      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setDeleteId(null)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-80 rounded-xl border bg-card p-5 shadow-lg"
          >
            <h3 className="text-base font-semibold">Delete this chat?</h3>
            <p className="mt-1 text-sm text-muted-foreground">This cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-lg bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
