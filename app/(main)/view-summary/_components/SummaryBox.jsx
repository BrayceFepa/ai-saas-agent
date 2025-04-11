import React from 'react'
import ReactMarkdown from 'react-markdown'

const SummaryBox = ({summary}) => {
  return (
      <div className='h-[60vh] overflow-auto'>
          <ReactMarkdown className='text-base/8'>
              {summary}
          </ReactMarkdown>
      </div>
  )
}

export default SummaryBox