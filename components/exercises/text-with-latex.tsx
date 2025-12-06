import { cn } from '@/lib/utils'
import { Latex } from './latex'
import { ReactNode } from 'react'

interface TextWithLatexProps {
  children: ReactNode
  className?: string
}

function getExpressionObjectArray(text: string) {
  const expressionObjectArray: {
    value: string
    isLatex: boolean
    index: number
  }[] = []

  let openIndex = -1;
  let closeIndex = -1;

  let normalText = ''
  let order = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '$' && openIndex === -1) {
      openIndex = i;
    } else if (text[i] === '$' && openIndex !== -1) {
      closeIndex = i;
      expressionObjectArray.push({
        value: text.slice(openIndex + 1, closeIndex),
        isLatex: true,
        index: order,
      })
      order++
      openIndex = -1;
    } else if (text[i] !== '$' && text[i] !== ' ' && openIndex === -1 && text[i + 1] !== '$' && text[i + 1] !== undefined && text[i + 1] !== ' ') {
      normalText += text[i];
    } else if (text[i] !== '$' && text[i] !== ' ' && openIndex === -1 && (text[i + 1] === '$' || text[i + 1] === undefined || text[i + 1] === ' ')) {
      normalText += text[i];
      expressionObjectArray.push({
        value: normalText,
        isLatex: false,
        index: order,
      })
      order++
      normalText = '';
    }
  }

  return expressionObjectArray
}

export function TextWithLatex({ children: text, className }: TextWithLatexProps) {
  const expressionObjectArray = getExpressionObjectArray(text as string);

  return (
    <div className={cn('flex justify-start items-center gap-1 w-full flex-wrap', className)}>
      {expressionObjectArray.map((expression, index) => {
        if (expression.isLatex) {
          return <Latex key={index}>{expression.value}</Latex>
        } else {
          return <span key={index}>{expression.value}</span>
        }
      })}
    </div>
  )
}
