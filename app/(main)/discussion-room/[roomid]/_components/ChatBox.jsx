import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api';
import { AiModelToGenerateFeedbackAndNotes } from '@/services/GlobalServices'
import { useMutation } from 'convex/react';
import { LoaderCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';

const ChatBox = ({ conversation, enableFeedbackNotes,coachingOption }) => {
  
  const [loading, setLoading] = useState(false);
  const updateSummary = useMutation(api.DiscussionRoom.UpdateSummary);
  const { roomid } = useParams();

  const generateFeedbackNotes = async() => {
    try {
      setLoading(true);
      const result = await AiModelToGenerateFeedbackAndNotes(coachingOption, conversation);
      console.log("result.content", result.content);
      await updateSummary({
        id: roomid,
        summary: result.content
      });
      setLoading(false);
      toast("Feedback/Notes Saved")
    } catch (error) {
      setLoading(false);
      toast.error("Error, Try Again")
      console.error("feedbackErr", error)
    }
  }

  return (
      <div>
           <div className="h-[60vh] bg-secondary border rounded-4xl flex flex-col relative p-4 overflow-auto scrollbar-hide">
              {/* <div> */}
                  {conversation.map((item, index) => (
                      <div key={index} className={`flex ${item?.role=="user" && " justify-end"}`}>
                          {item?.role == "assistant" ? <h2 className='p-1 px-2 bg-primary mt-2 text-white inline-block rounded-md'>{item?.content}</h2> : <h2 className='p-1 px-2 bg-gray-200 mt-2 inline-block rounded-md'>{item?.content}</h2>}
                      </div>
                  ))}
            {/* </div> */}
          </div>
          {!enableFeedbackNotes ?<></> : <Button onClick={generateFeedbackNotes} disabled={loading} className="mt-4 w-full">
              {loading && <LoaderCircle className='animate-spin'/>}
        Generate Feedback/Notes</Button>}
    </div>
  )
}

export default ChatBox