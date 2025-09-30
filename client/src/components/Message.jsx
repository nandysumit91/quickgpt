import React, { useEffect } from 'react'
import { assets } from '../assets/assets'
import moment from 'moment'
import Markdown from 'react-markdown'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-python'

const Message = ({Message}) => {

  useEffect(()=>{
    Prism.highlightAll()
  },[Message.content])

  return (
    <div>
      {Message.role === "user" ? (
        <div className='flex items-start justify-end my-4 gap-2'>
          <div className='flex flex-col gap-2 p-2 px-4 bg-gray-50 dark:bg-[#57317C]/30 border border-gray-200 dark:border-[#80609F]/30 rounded-md max-w-2xl'>
            <p className='text-sm text-gray-800 dark:text-white'>{Message.content}</p>
            <span className='text-xs text-gray-400 dark:text-[#B1A6C0]'>
              {moment(Message.timestamp).fromNow()}</span>
          </div>
          <img src={assets.user_icon} alt="" className='w-8 rounded-full' />
        </div>
      ) : (
        <div className='flex items-start gap-2 my-4'>
          <img src={assets.logo} alt="" className='w-8 rounded-full' />
          <div className='flex flex-col gap-2 p-2 px-4 max-w-2xl bg-blue-50 dark:bg-[#57317C]/30 border border-blue-200 dark:border-[#80609F]/30 rounded-md'>
            {Message.isImage ? (
              <img src={Message.content} alt="" className='w-full max-w-md mt-2 rounded-md' />
            ) : (
              <div className='text-sm text-gray-800 dark:text-white'>
                <Markdown
                  components={{
                    p({children}) {
                      return <p className='leading-7 whitespace-pre-wrap'>{children}</p>
                    },
                    a({href, children, ...props}) {
                      return (
                        <a href={href} target='_blank' rel='noreferrer' className='text-blue-600 dark:text-blue-400 underline' {...props}>
                          {children}
                        </a>
                      )
                    },
                    ul({children}) {
                      return <ul className='list-disc pl-6 space-y-1'>{children}</ul>
                    },
                    ol({children}) {
                      return <ol className='list-decimal pl-6 space-y-1'>{children}</ol>
                    },
                    li({children}) {
                      return <li className='leading-7'>{children}</li>
                    },
                    blockquote({children}) {
                      return <blockquote className='border-l-4 border-gray-300 dark:border-gray-600 pl-3 italic opacity-90'>{children}</blockquote>
                    },
                    table({children}) {
                      return <div className='overflow-auto'><table className='min-w-full text-left border-collapse'>{children}</table></div>
                    },
                    th({children}) {
                      return <th className='border px-3 py-2 bg-gray-100 dark:bg-[#3a2d50]'>{children}</th>
                    },
                    td({children}) {
                      return <td className='border px-3 py-2'>{children}</td>
                    },
                    code({inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '')
                      const codeText = String(children).replace(/\n$/, '')
                      if (!inline && match) {
                        const lang = match[1]
                        const handleCopy = async () => {
                          try {
                            await navigator.clipboard.writeText(codeText)
                          } catch {}
                        }
                        return (
                          <div className='relative my-3 rounded-md overflow-hidden border border-gray-200 dark:border-[#6f5a8d]/40'>
                            <div className='flex items-center justify-between text-xs px-3 py-2 bg-gray-100 dark:bg-[#3a2d50]'>
                              <span className='uppercase tracking-wide opacity-70'>{lang}</span>
                              <button onClick={handleCopy} className='px-2 py-0.5 rounded border border-gray-300 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-[#4a3a63]'>Copy</button>
                            </div>
                            <pre className={`language-${lang} m-0 p-3 overflow-auto max-h-[480px]`}>
                              <code className={`language-${lang}`} {...props}>
                                {codeText}
                              </code>
                            </pre>
                          </div>
                        )
                      }
                      return (
                        <code className='px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#3a2d50] text-[0.9em]' {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {Message.content}
                </Markdown>
              </div>
            )}
            <span className='text-xs text-gray-400 dark:text-[#B1A6C0]'>{moment(Message.timestamp).fromNow()}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Message
