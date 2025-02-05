import { useState, useEffect, useRef } from "react";
import { Plus, Send } from "lucide-react";
import { useAppContext } from "../../AppContext";

export default function LeftPanel() {
  const { imageUrl } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Add default bot message when component mounts
  useEffect(() => {
    setMessages([
      { text: "To give you the best suggestions, what are your interests?", sender: "bot" },
    ]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to send message
  const sendMessage = async () => {
    if (inputMessage.trim() === "") return;

    const userMessage = { text: inputMessage, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await fetch("https://house-analysis-439e40d8d94b.herokuapp.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: userMessage.text }),
      });

      const result = await response.json();
      console.log(result)
      if (result) {
        setMessages((prev) => [...prev, { text: result, sender: "bot" }]);
      } else {
        setMessages((prev) => [...prev, { text: "Unexpected response from server.", sender: "bot" }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { text: "Error connecting to server!", sender: "bot" }]);
    }
    setIsTyping(false);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg lg:col-span-6 flex flex-col h-[calc(100vh-64px)]">
      <h2 className="text-lg font-semibold px-4 pt-1">Satellite View</h2>

      {/* Image Section */}
      <div className="relative h-[50vh] overflow-hidden rounded-lg p-4">
        <img
          src={imageUrl || "/assets/image.png"}
          alt="Satellite view"
          className="object-fit w-full h-full"
        />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`text-sm border border-gray-200 rounded-xl py-3 px-4 max-w-[70%] break-words 
              ${msg.sender === "bot" ? "bg-purple-600 text-white self-start" : "bg-gray-400 text-black self-end ml-auto"}`}
            style={{ wordWrap: "break-word", overflowWrap: "break-word" }}
          >
            <p>{msg.text}</p>
          </div>
        ))}
        {isTyping && (
          <div className="text-sm bg-purple-600 text-white self-start border border-gray-200 rounded-xl py-3 px-4 max-w-[70%]">
            Typing...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 sticky bottom-0 bg-white">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Plus size={20} />
          </button>
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center">
            <input
              type="text"
              placeholder="Ask something..."
              className="bg-transparent flex-1 outline-none text-sm"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} className="ml-2 text-blue-600">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
