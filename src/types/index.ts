export type MessageRole = 'user' | 'assistant'

export interface MessageContentPart {
  type: 'text' | 'image_url'
  text?: string
  image_url?: { url: string }
}

export type MessageContent = string | MessageContentPart[]

export interface ChatMessage {
  role: MessageRole
  /** Content sent to/from the API */
  content: MessageContent
  /** Raw accumulated streaming content (before reasoning extraction) */
  rawContent: string
  /** Extracted reasoning/thinking text from <think> tags or reasoning_content delta */
  reasoning: string
  /** Base64 data URLs of images attached by the user */
  images: string[]
  /** True while the assistant response is still streaming */
  isStreaming: boolean
  /** True if the request was cancelled by the user */
  cancelled: boolean
  /** User-friendly error message (shown in the bubble) */
  friendlyError: string | null
  /** Raw error details (shown in the error modal) */
  errorDetail: string | null
  /** Whether the reasoning section is expanded */
  reasoningOpen: boolean
}

export interface AppConfig {
  openAIBaseURL: string
  capabilities: string[]
  instanceName: string
  engineName: string
}

