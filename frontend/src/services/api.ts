import { Client } from "@gradio/client";

export const predictIncident = async (inputText: string) => {
  try {
    const client = await Client.connect("https://81f410793c9619b068.gradio.live/");
    
    // Check the function index — most Gradio apps have one interface function at index 0
    const result = await client.predict(0, {
      input_text: inputText
    });

    console.log(result.data);
    return result.data;
  } catch (error) {
    console.error("Prediction error:", error);
    throw error;
  }
};
