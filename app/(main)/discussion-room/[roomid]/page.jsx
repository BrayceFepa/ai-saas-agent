"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { AiModel, ConvertTextToSpeech, getToken } from "@/services/GlobalServices";
import { CoachingExpert } from "@/services/Options";
import { UserButton } from "@stackframe/stack";
import { RealtimeTranscriber } from "assemblyai";
import { useMutation, useQuery } from "convex/react";
import { Loader2Icon } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import ChatBox from "./_components/ChatBox";
import { toast } from "sonner";
import { UserContext } from "@/app/_context/UserContext";
import Webcam from "react-webcam";

// import RecordRTC from "recordrtc";
// const RecordRTC = dynamic(() => import('recordrtc'), { ssr: false });

const DiscussionRoom = () => {
  const { roomid } = useParams();
  const { userData, setUserData } = useContext(UserContext);

  const DiscussionRoomData = useQuery(api.DiscussionRoom.getDiscussionRoom, {
    id: roomid,
  });
  const [expert, setExpert] = useState();
  const [enableMic, setEnableMic] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const recorder = useRef(null);
  const [audioUrl, setAudioUrl] = useState();
  const [enableFeedbackNotes, setEnableFeedbackNotes] = useState(false);

  const realTimeTranscriber = useRef(null);

  const [transcribe, setTranscribe] = useState();
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  const UpdateConversation = useMutation(api.DiscussionRoom.UpdateConversation);
  const UpdateUserToken = useMutation(api.users.UpdateUserToken)

  let silenceTimeout;
  let texts = {};

  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExpert?.find(
        (item) => item.name == DiscussionRoomData.expertName
      );
      // console.log(Expert);
      setExpert(Expert);
    }
  }, [DiscussionRoomData]);

  const connectToServer = async () => {
    try {
      setLoading(true);


    //init Assembly AI
    realTimeTranscriber.current = new RealtimeTranscriber({
      token: await getToken(),
      sampleRate:16_000
    });

    realTimeTranscriber.current.on("transcript", async (transcript) => {
      // console.log(transcript);
      let msg = '';

      if (transcript.message_type == "FinalTranscript") {
        setConversation((prev) => ([...prev, { role: "user", content: transcript.text }]));
        await updateUserTokenMethod(transcript.text); //update user generated token
       
        
      }

      texts[transcript.audio_start] = transcript.text;
      const keys = Object.keys(texts);
      keys.sort((a, b) => a - b);
      for (const key of keys) {
        if (texts[key]) {
          msg+=`${texts[key]}`
        }
      }
      setTranscribe(msg);
    });

    await realTimeTranscriber.current.connect();
    setLoading(false);
      setEnableMic(true);
      toast("Connected");

    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        // Dynamically import the RecordRTC class on the client
        const RecordRTC = (await import("recordrtc")).default;

        recorder.current = new RecordRTC(stream, {
          type: "audio",
          mimeType: "audio/webm;codecs=pcm",
          recorderType: RecordRTC.StereoAudioRecorder,
          timeSlice: 250,
          desiredSampRate: 16000,
          numberOfAudioChannels: 1,
          bufferSize: 4096,
          audioBitsPerSecond: 128000,

          ondataavailable: async (blob) => {
            if (!realTimeTranscriber.current || !realTimeTranscriber.current.sendAudio) return;
            clearTimeout(silenceTimeout);

            const buffer = await blob.arrayBuffer();
            // console.log("buffer",buffer);
            realTimeTranscriber.current.sendAudio(buffer)

            silenceTimeout = setTimeout(() => {
              console.log("User stopped talking");
            }, 2000);
          },
        });

        recorder.current.startRecording();
        toast("Only English is supported");
      } catch (err) {
        console.error(err);
      }
    }
    } catch (error) {
      setLoading(false);
      setEnableMic(false);
      alert("try again")
    }
  };

  const disconnectToServer = async(e) => {
    e.preventDefault();
    setLoading(true);
    await realTimeTranscriber.current.close();
    recorder.current.pauseRecording();
    recorder.current = null;

    setEnableMic(false);
    toast("Disconnected")
    await UpdateConversation({
      id: DiscussionRoomData._id,
      conversation: conversation
    })
    setLoading(false);
    setEnableFeedbackNotes(true);
  };

  const updateUserTokenMethod = async (text) => {
    const tokenCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const result = await UpdateUserToken({
      id: userData?._id,
      credits: (Number(userData?.credits) - Number(tokenCount))
    });

    setUserData(prev => ({
      ...prev,
      credits: Number(userData?.credits) - Number(tokenCount)
    }))
  }

  useEffect(() => {
    // clearTimeout(waitForPause);
    async function fetchData() {
      try {
        if (conversation[conversation.length - 1]?.role == "user" && DiscussionRoomData) {
        //Calling AI text Model to get response;
        const lastTwoMsg = conversation.slice(-2)
        const aiResponse = await AiModel(DiscussionRoomData.topic, DiscussionRoomData.coachingOption, lastTwoMsg);
          // console.log("aiRespo", aiResponse);
          if (aiResponse) {
            const url = await ConvertTextToSpeech(aiResponse?.content, DiscussionRoomData.expertName);
            // console.log("audioUrl", url);
        setAudioUrl(url);

        setConversation((prev) => ([...prev, aiResponse]));
        await updateUserTokenMethod(aiResponse?.content); //update ai generated token
          }
        
      }
      } catch (error) {
        console.log("aiRespErr", error)
      }
    }
    fetchData();
    // const waitForPause = setTimeout(() => {
    //   console.log("wait...");
    // }, 500)
    
  }, [conversation]);

  useEffect(() => {
    let timer;
    
    if (enableMic) {
      // Show the message
      setShowMessage(true);
      
      // Hide the message after 10 seconds
      timer = setTimeout(() => {
        setShowMessage(false);
      }, 10000); // 10 seconds in milliseconds
    } else {
      // If enableMic is turned off, hide the message immediately
      setShowMessage(false);
    }

    // Clean up the timer when the component unmounts or enableMic changes
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [enableMic]);

  return (
    <div className="-mt-12">
      <h2 className="text-lg font-bold">
        {DiscussionRoomData?.coachingOption} ({
  DiscussionRoomData && DiscussionRoomData?.topic?.length > 40
    ? `${DiscussionRoomData?.topic?.substring(0, 40)}...`
    : DiscussionRoomData?.topic
})
      </h2>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 ">
          <div className="h-[60vh] bg-secondary border rounded-4xl flex flex-col items-center justify-center relative">
            {expert && (
              <Image
                src={expert.avatar}
                alt="Avatar"
                width={200}
                height={200}
                className={`h-[80px] w-[80px] rounded-full object-cover ${enableMic && " animate-pulse"}`}
              />
            )}
            <h2 className="text-gray-500">{expert && expert?.name}</h2>
            <audio src={audioUrl} type="audio/mp3" autoPlay></audio>
            <div className="p-5 bg-gray-200 px-10 rounded-lg absolute bottom-10 right-10">
              <UserButton />
            </div>
            {/* <div className="absolute bottom-10 right-10">
              <Webcam height={80} width={130} className="rounded-2xl"/>
            </div> */}
          </div>

          <div className="mt-5 flex items-center justify-center">
            {!enableMic ? (
              <Button onClick={connectToServer} disabled={loading}>{loading&& <Loader2Icon className="animate-spin"/>} Connect</Button>
            ) : (
              <Button variant="destructive" onClick={disconnectToServer} disabled={loading}>
               {loading&& <Loader2Icon className="animate-spin"/>} Disconnect
              </Button>
            )}
            {enableMic && showMessage && <div className="font-bold text-primary wave-text ml-2">
              <span>S </span>
              <span>t </span>
              <span>a</span>
              <span>r </span>
              <span>t </span>
              {" "}
              <span>T</span>
              <span>a</span>
              <span>l</span>
              <span>k</span>
              <span>i</span>
              <span>n</span>
              <span>g</span>
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </div>}
          </div>
        </div>

        <div>
          <ChatBox conversation={conversation} enableFeedbackNotes={enableFeedbackNotes} coachingOption={DiscussionRoomData?.coachingOption} />
        </div>
      </div>

      <div>
        <h2>{transcribe}</h2>
      </div>
    </div>
  );
};

export default DiscussionRoom;
