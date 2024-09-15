import { Fragment, useEffect, useRef, useState, useMemo } from "react";
import LoadingIcon from "../icons/three-dots.js";
import Image from "next/image";
import BottomIcon from "../icons/bottom.js";
import { IconButton } from "./button";
import SendWhiteIcon from "../icons/send-white.js";
import StopIcon from "../icons/pause.js";
import dynamic from "next/dynamic";
import styles from "./chat.module.scss";
import ScrollContainer from "./ScrollContainer.js";
import Model from "./model.js";
import Card from "./card.js";
import Visualization from "./visualization.js";
import { useRouter } from "next/router";

export default function Chat() {
    const router = useRouter();
    const performance = router.query.option == "performance";

    const DEFAULT_TOPIC = "Conversation";

    const [loading, setLoading] = useState(false);

    const [session, setSession] = useState({
        id: "",
        topic: "",
    });

    const [messages, setMessages] = useState([]);

    const [userInput, setUserInput] = useState("");
    const [inputRows, setInputRows] = useState(2);

    const inputRef = useRef();
      const { shouldSubmit } = useSubmitHandler();
    
      const onInput = (text) => {
        setUserInput(text);
        const n = text.trim().length;
      };

      const testEasy = [
        {
            type: "Model",
            name: "GPT-3",
            reasoning: "GPT-3 is a powerful language model that can generate human-like text."
        }
    ]

    const testHard = [
        {
            type: "Model",
            name: "GPT-3",
            reasoning: "GPT-3 is a powerful language model that can generate human-like text."
        },
        {
            type: "Tool",
            name: "GPT-4",
            reasoning: "GPT-4 is a powerful language model that can generate human-like text."
        },
        {
            type: "Assistant",
            name: "GPT-5",
            reasoning: "GPT-5 is a powerful language model that can generate human-like text."
        }
    ]

    const [isEasyMode, setIsEasyMode] = useState(false);
    const [models, setModels] = useState(testHard);

    const Markdown = dynamic(async () => (await import("./markdown")).Markdown, {
        loading: () => <LoadingIcon />,
    });

    const onInputKeyDown = (e) => {
        // if ArrowUp and no userInput, fill with last input
        if (
          e.key === "ArrowUp" &&
          userInput.length <= 0 &&
          !(e.metaKey || e.altKey || e.ctrlKey)
        ) {
          setUserInput(localStorage.getItem(LAST_INPUT_KEY) ?? "");
          e.preventDefault();
          return;
        }
        if (shouldSubmit(e)) {
          onSubmit(userInput);
          e.preventDefault();
        }
      };

      const onSubmit = (userInput) => {
        if (userInput.trim() === "") return;    
        if (loading) return;
        setLoading(true);

        setMessages([
            ...messages,
            {
                role: "user",
                content: userInput,
                date: new Date(),
                streaming: false,
            },
            {
                role: "system",
                content: "",
                date: new Date(),
                streaming: true,
            }
        ])

        sendMessage(userInput);

        setUserInput("");
        console.log(messages)
      };

    function sendMessage(message) {
      console.log("Sending message: ", message);
        setModels([]);
        let loadingMessage = ""
        
          const es = new EventSource("http://127.0.0.1:5000/response");
          es.onmessage = (e) => {
            console.log(e.data);
            
            if (e.data == "END") {
              console.log("Closing connection");
              es.close();
              setLoading(false);
            }

            else {
              const object = JSON.parse(e.data);
              if (object["data"]) {
                loadingMessage += object["data"];
                setMessages((prev) => {
                  return [
                      ...prev.slice(0, prev.length - 1),
                      {
                        role: "system",
                        content: loadingMessage,
                        date: new Date(),
                        streaming: false,
                      },
                    ];
                });
              }
              if (object["type"]) {
                if (object["type"] === "easy") {
                  setIsEasyMode(true);
                } else if (object["type"] === "hard") {
                  setIsEasyMode(false);
                }
              }
              if (object["models"]) {
                setModels(object["models"]);
              }
            }
          };

    }

    return (
      <div className="flex">
      <div className={`${styles["sidebar"]}`}>
      <div className={`h-full m-8 border-2 border-[#5a6087] rounded-lg p-4`}>
      <div className="window-header">
            <div className={`window-header-title ${styles["chat-body-title"]}`}>
              <div
                className={`window-header-main-title ${styles["chat-body-main-title"]}`}
              >
                Agents
              </div>
              <div className="window-header-sub-title">
                {session.id}
              </div>
            </div>
          </div>
        {/* <ul className={`${styles["sidebar-list"]}`}> */}
          <Visualization 
            easy={isEasyMode}
            models={models}
          />
          {/* {actions.map((action, i) => {
            return (
              <li key={i}>
                {action}
              </li>
            );
          })} */}
        {/* </ul> */}
      </div>
      </div>
        <div className={`grid grid-cols-subgrid col-span-2`} >
        <div className={`${styles["chat"]}`}
        key={session.id}>
          {/* <div className={`h-screen m-8 border-2 border-[#5a6087] rounded-lg p-4`}> */}
          <div className="window-header">
            <div className={`window-header-title ${styles["chat-body-title"]}`}>
              <div
                className={`window-header-main-title ${styles["chat-body-main-title"]}`}
              >
                {!session.topic ? DEFAULT_TOPIC : session.topic}
              </div>
              <div className="window-header-sub-title">
                {session.id}
              </div>
            </div>
          </div>
    
          <div
            className={styles["chat-body"]}
          >
            <ScrollContainer >
            {messages.toReversed().map((message, i) => {
              console.log(message);
              const isUser = message.role === "user";
        
              return (
                <Fragment key={`${i}/${message.id}`}>
                  <div
                    className={
                      isUser ? styles["chat-message-user"] : styles["chat-message"]
                    }
                  >
                    <div className={styles["chat-message-container"]}>
                      <div className={styles["chat-message-item"]}>
                      <Markdown
                            content={message.content}
                            loading={message.streaming}
                          />
                      </div>
                      {
                        message.role === "user" && (
                          <div className={styles["chat-message-action-date"]}>
                        {message.date.toLocaleString()}
                      </div>
                        )
                      }
                      {message.role === "system" && (
                        <div className={styles["chat-message-action-date-bot"]}>
                          {message.date.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </Fragment>
              );
            })}
            </ScrollContainer>
          </div>
          <div className={styles["chat-input-panel"]}>
    
            <label
              className={`${styles["chat-input-panel-inner"]}`}
              htmlFor="chat-input"
            >
              <textarea
                id="chat-input"
                ref={inputRef}
                className={styles["chat-input"]}
                placeholder={"Type a message..."}
                onInput={(e) => onInput(e.currentTarget.value)}
                value={userInput}
                onKeyDown={onInputKeyDown}
                rows={inputRows}
                autoFocus={true}
                style={{
                  fontSize: '1rem',
                }}
              />
              <IconButton
                  icon={<SendWhiteIcon />}
                  text={"Send"}
                  className={styles["chat-input-send"]}
                  type="primary"
                  onClick={() => onSubmit(userInput)}
                />
            </label>
          </div>
        </div>
        </div>
        </div>
        // </div>
      );
}

  export function ScrollDownToast(prop) {
    return (
      <div
        className={
          styles["toast-container"] + (prop.show ? ` ${styles["show"]}` : "")
        }
      >
        <div className={styles["toast-content"]} onClick={() => prop.onclick()}>
          <BottomIcon />
        </div>
      </div>
    );
  }

  function useSubmitHandler() {
    const isComposing = useRef(false);
  
    useEffect(() => {
      const onCompositionStart = () => {
        isComposing.current = true;
      };
      const onCompositionEnd = () => {
        isComposing.current = false;
      };
  
      window.addEventListener("compositionstart", onCompositionStart);
      window.addEventListener("compositionend", onCompositionEnd);
  
      return () => {
        window.removeEventListener("compositionstart", onCompositionStart);
        window.removeEventListener("compositionend", onCompositionEnd);
      };
    }, []);
  
    const shouldSubmit = (e) => {
      // Fix Chinese input method "Enter" on Safari
      if (e.keyCode == 229) return false;
      if (e.key !== "Enter") return false;
      if (e.key === "Enter" && (e.nativeEvent.isComposing || isComposing.current))
        return false;
      return (
        (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) === false &&
        !isComposing.current
      );
    };
  
    return {
      shouldSubmit,
    };
  }