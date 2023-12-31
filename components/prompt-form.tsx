import { UseChatHelpers } from 'ai/react'
import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import { IconArrowElbow, IconPlus } from '@/components/ui/icons'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { Button } from '@nextui-org/react'
import SettingsModal from './settings-modal'

export interface PromptProps
  extends Pick<UseChatHelpers, 'input' | 'setInput'> {
  onSubmit: (value: string) => Promise<void>
  isLoading: boolean
}

export function PromptForm({
  onSubmit,
  input,
  setInput,
  isLoading,
}: PromptProps) {

  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div className='relative'>

      <SettingsModal />

      <form
        onSubmit={async e => {
          e.preventDefault()
          if (!input?.trim()) {
            return
          }
          setInput('')
          await onSubmit(input)
        }}
        ref={formRef}
        className='w-full'
      >
        <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background rounded-lg">

          <Textarea
            ref={inputRef}
            tabIndex={0}
            onKeyDown={onKeyDown}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Send a message..."
            spellCheck={false}
            className="min-h-[60px] w-full resize-none bg-transparent pl-4 pr-14 py-[1.3rem] focus-within:outline-none sm:text-sm"
          />

          <div className="absolute right-0 top-4 sm:right-4">

            <Button
              type="submit"
              size="sm"
              color='primary'
              id="submit-button"
              isIconOnly
              disabled={isLoading || input === ''}
            >
              <IconArrowElbow />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
      </form>

    </div>
  )
}
