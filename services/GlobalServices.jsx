import axios from "axios";
import OpenAI from "openai";
import { ExpertsList } from "./Options";
import { PollyClient, SynthesizeSpeechCommand, VoiceId } from "@aws-sdk/client-polly";

export const getToken = async () => {
    try {
        const result = await axios.get("/api/getToken");
        // console.log("result.data", result.data)
        return result.data;
    } catch (error) {
        console.log(error);
    }
};


const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.NEXT_PUBLIC_AI_OPENROUTER,
  dangerouslyAllowBrowser:true
})
export const AiModel = async (topic, coachingOption, lasTwoConversation) => {
    try {
        const option = ExpertsList.find((item) => item.name == coachingOption);
    const PROMPT = (option.prompt).replace("{user_topic}", topic);
    const completion = await openai.chat.completions.create({
    model: "meta-llama/llama-4-maverick:free",
        messages: [
    {role:"assistant", content: PROMPT},
      ...lasTwoConversation
    ],
  })
        // console.log(completion.choices[0].message);
        return completion.choices[0].message;
    } catch (error) {
        console.log("AiModelErr", error);
    }
};


export const AiModelToGenerateFeedbackAndNotes = async ( coachingOption, conversation) => {
    try {
        const option = ExpertsList.find((item) => item.name == coachingOption);
    const PROMPT = (option.summeryPrompt);
    const completion = await openai.chat.completions.create({
    model: "meta-llama/llama-4-maverick:free",
        messages: [
            ...conversation,
    {role:"assistant", content: PROMPT},
    ],
  })
        // console.log(completion.choices[0].message);
        return completion.choices[0].message;
    } catch (error) {
        console.log("AiModelErr", error);
    }
};

export const ConvertTextToSpeech = async (text, expertName) => {
    try {
        const pollyClient = new PollyClient({
            region: "us-east-1",
            credentials: {
                accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
                secretAccessKey:process.env.NEXT_PUBLIC_AWS_SECRET_KEY
            }
        });
        const command = new SynthesizeSpeechCommand({
            Text: text,
            OutputFormat: 'mp3',
            VoiceId:expertName
        });

        const { AudioStream } = await pollyClient.send(command);
        const audioArrayBuffer = await AudioStream.transformToByteArray();
        const audioBlob = new Blob([audioArrayBuffer], { type: "audio/mp3" });
        const audioUrl = URL.createObjectURL(audioBlob);
        return audioUrl;
    } catch (error) {
        console.error("pollyErr", error)
    }
}